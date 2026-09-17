/* 팀 동기화 (Supabase). 모델·룩·배경 컷·배경을 items 테이블 + avatar-images 버킷에 저장하고, 여러 브라우저/사용자 사이에서 맞춘다.
   - 로컬 상태(S)가 진실의 원본이고, sync()가 로컬↔원격을 병합한다. 이미지는 로컬에서는 dataURL, 원격에서는 Storage 파일.
   - 삭제 추적: 지난 동기화에서 알던 id 집합(S.cloudIds)과 비교해 로컬에서 사라진 것은 원격 삭제, 원격에서 사라진 것은 로컬 삭제.
   - 충돌: 원격 updated_at이 로컬 cloudAt보다 새롭고 로컬이 그 사이 안 바뀌었으면 원격 적용, 둘 다 바뀌었으면 로컬 우선(다음 push). */
(function(root){
const CFG_KEY='aimodel.supabase.v1';
const Cloud={client:null,user:null,status:'off',msg:'설정 없음',busy:false,timer:null,channel:null,hooks:{},
  cfg(){try{return Object.assign({url:'',anonKey:''},JSON.parse(localStorage.getItem(CFG_KEY)||'{}'));}catch(e){return {url:'',anonKey:''};}},
  saveCfg(c){localStorage.setItem(CFG_KEY,JSON.stringify(c));},
  set(status,msg){this.status=status;this.msg=msg||'';(this.hooks.onStatus||(()=>{}))(status,msg);},
  async init(hooks){this.hooks=hooks||{};const c=this.cfg();if(!c.url||!c.anonKey||!root.supabase){this.set('off',root.supabase?'설정 없음':'supabase-js 로드 실패');return;}
    try{this.client=root.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
      const {data:{session}}=await this.client.auth.getSession();this.user=session?session.user:null;
      this.client.auth.onAuthStateChange((_e,s)=>{this.user=s?s.user:null;if(this.user){this.set('idle','로그인: '+this.user.email);this.subscribe();this.schedule(300);}else{this.unsubscribe();this.set('out','로그아웃');}});
      if(this.user){this.set('idle','로그인: '+this.user.email);this.subscribe();await this.sync();}else this.set('out','로그인 필요');}
    catch(e){this.set('err','초기화 실패: '+(e.message||e));}},
  async signIn(email,pw){const {error}=await this.client.auth.signInWithPassword({email,password:pw});if(error)throw error;},
  async signUp(email,pw){const {data,error}=await this.client.auth.signUp({email,password:pw});if(error)throw error;return data;},
  async signOut(){await this.client.auth.signOut();},
  subscribe(){if(this.channel||!this.client)return;try{this.channel=this.client.channel('items-live').on('postgres_changes',{event:'*',schema:'public',table:'items'},()=>this.schedule(800)).subscribe();}catch(e){}},
  unsubscribe(){if(this.channel){try{this.client.removeChannel(this.channel);}catch(e){}this.channel=null;}},
  schedule(ms){clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),ms==null?2500:ms);},

  /* ---- 직렬화 ---- */
  strip(o,drop){const r={};for(const k in o){if(drop.includes(k)||k.startsWith('cloud')||k==='busy'||k==='busyPanel')continue;r[k]=o[k];}return r;},
  sig(data){return JSON.stringify(data);},
  localItems(S){const out=[];(S.cands||[]).forEach(c=>{if(c.compare||!c.img)return;
      out.push({obj:c,id:c.id,kind:'model',parent:null,data:this.strip(c,['img','imgOrig','looks','scenes','lookWork','style']),img:c.img,orig:c.imgOrig||null});
      (c.looks||[]).forEach(l=>{if(l.img&&!l.busy)out.push({obj:l,id:l.id,kind:'look',parent:c.id,data:this.strip(l,['img']),img:l.img});});
      (c.scenes||[]).forEach(x=>{if(x.img&&!x.busy)out.push({obj:x,id:x.id,kind:'scene',parent:c.id,data:this.strip(x,['img']),img:x.img});});});
    (S.bgs||[]).forEach(b=>{if(b.img&&!b.busy)out.push({obj:b,id:b.id,kind:'bg',parent:null,data:this.strip(b,['img']),img:b.img});});return out;},
  toBlob(dataUrl){const m=/^data:([^;]+);base64,(.*)$/.exec(dataUrl);if(!m)return null;const bin=atob(m[2]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return {blob:new Blob([u],{type:m[1]}),ext:m[1]==='image/png'?'png':'jpg'};},
  async upload(path,dataUrl){const b=this.toBlob(dataUrl);if(!b)throw new Error('이미지 형식');const {error}=await this.client.storage.from('avatar-images').upload(path,b.blob,{upsert:true,contentType:b.blob.type});if(error)throw error;return path;},
  async download(path){const {data,error}=await this.client.storage.from('avatar-images').download(path);if(error)throw error;return await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(data);});},

  /* ---- 동기화 본체 ---- */
  async sync(){const S=this.hooks.state&&this.hooks.state();if(!this.client||!this.user||!S||this.busy)return;this.busy=true;this.set('sync','동기화 중…');
    try{
      const {data:rows,error}=await this.client.from('items').select('id,kind,parent_id,data,image_path,orig_path,updated_at').order('created_at');if(error)throw error;
      const remote=new Map(rows.map(r=>[r.id,r]));const local=this.localItems(S);const localMap=new Map(local.map(x=>[x.id,x]));
      const known=new Set(S.cloudIds||[]);let pushed=0,pulled=0,removed=0,deleted=0;
      // 1) 로컬에서 사라진(예전에 동기화된) 것 → 원격 삭제
      for(const id of known){if(!localMap.has(id)&&remote.has(id)){const r=remote.get(id);await this.client.from('items').delete().eq('id',id);const paths=[r.image_path,r.orig_path].filter(Boolean);if(paths.length)await this.client.storage.from('avatar-images').remove(paths);remote.delete(id);deleted++;}}
      // 2) 원격 → 로컬 (새 항목, 또는 원격이 더 새로운 항목)
      const ensureModel=id=>{let m=(S.cands||[]).find(c=>c.id===id);return m;};
      const byKind={model:[],look:[],scene:[],bg:[]};rows.forEach(r=>{if(remote.has(r.id))byKind[r.kind].push(r);});
      for(const kind of ['model','bg','look','scene']){for(const r of byKind[kind]){const loc=localMap.get(r.id);
        if(!loc){if(known.has(r.id))continue; // 로컬에서 지운 것(위에서 처리됨)
          const obj=Object.assign({},r.data,{id:r.id});obj.cloudSig=this.sig(r.data);obj.cloudAt=r.updated_at;
          if(r.image_path){try{obj.img=await this.download(r.image_path);}catch(e){continue;}}if(r.orig_path){try{obj.imgOrig=await this.download(r.orig_path);}catch(e){}}
          if(kind==='model'){obj.looks=[];obj.scenes=[];S.cands.push(obj);}else if(kind==='bg'){S.bgs.push(obj);}else{const m=ensureModel(r.parent_id);if(!m)continue;const arr=kind==='look'?(m.looks=m.looks||[]):(m.scenes=m.scenes||[]);arr.push(obj);}
          pulled++;}
        else{const rs=this.sig(r.data);const localChanged=loc.obj.cloudSig!==this.sig(loc.data);const remoteNewer=!loc.obj.cloudAt||r.updated_at>loc.obj.cloudAt;
          if(remoteNewer&&rs!==loc.obj.cloudSig&&!localChanged){Object.assign(loc.obj,r.data);loc.obj.cloudSig=rs;loc.obj.cloudAt=r.updated_at;pulled++;}}}}
      // 3) 원격에서 사라진(예전에 동기화된) 로컬 항목 → 로컬 삭제
      for(const x of local){if(known.has(x.id)&&!remote.has(x.id)){this.removeLocal(S,x);removed++;}}
      // 4) 로컬 → 원격 (새 항목·변경 항목)
      const local2=this.localItems(S);
      for(const x of local2){const s=this.sig(x.data);const r=remote.get(x.id);const needImg=!x.obj.cloudImg&&x.img&&x.img.startsWith('data:');const needOrig=x.kind==='model'&&x.orig&&x.orig.startsWith('data:')&&!x.obj.cloudOrig;
        if(r&&x.obj.cloudSig===s&&!needImg&&!needOrig)continue;
        let image_path=r?r.image_path:null,orig_path=r?r.orig_path:null;
        if(needImg||(!image_path&&x.img)){const b=this.toBlob(x.img);image_path=`${x.kind}/${x.id}.${b?b.ext:'jpg'}`;await this.upload(image_path,x.img);x.obj.cloudImg=image_path;}
        if(needOrig||(x.orig&&!orig_path)){const b=this.toBlob(x.orig);orig_path=`model/${x.id}_orig.${b?b.ext:'jpg'}`;await this.upload(orig_path,x.orig);x.obj.cloudOrig=orig_path;}
        const {data:up,error:e2}=await this.client.from('items').upsert({id:x.id,kind:x.kind,parent_id:x.parent,data:x.data,image_path,orig_path}).select('updated_at').single();if(e2)throw e2;
        x.obj.cloudSig=s;x.obj.cloudAt=up.updated_at;pushed++;}
      S.cloudIds=this.localItems(S).map(x=>x.id);
      this.set('idle',`동기화됨 ${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}${pushed||pulled||removed||deleted?` · ↑${pushed} ↓${pulled}${removed?` −${removed}`:''}${deleted?` ✕${deleted}`:''}`:''}`);
      if(pulled||removed)(this.hooks.onPulled||(()=>{}))();(this.hooks.onSaved||(()=>{}))();}
    catch(e){this.set('err','동기화 실패: '+(e.message||e));}
    finally{this.busy=false;}},
  removeLocal(S,x){if(x.kind==='model')S.cands=S.cands.filter(c=>c.id!==x.id);else if(x.kind==='bg')S.bgs=S.bgs.filter(b=>b.id!==x.id);else{S.cands.forEach(m=>{if(m.looks)m.looks=m.looks.filter(l=>l.id!==x.id);if(m.scenes)m.scenes=m.scenes.filter(s=>s.id!==x.id);});}},
  /* 처음 연결할 때: 이 브라우저의 데이터를 전부 올리기 (cloudIds 비움 → 모두 새 항목으로 push) */
  async pushAll(){const S=this.hooks.state();S.cloudIds=[];this.localItems(S).forEach(x=>{delete x.obj.cloudSig;delete x.obj.cloudAt;delete x.obj.cloudImg;delete x.obj.cloudOrig;});await this.sync();}
};
root.Cloud=Cloud;
})(typeof window!=='undefined'?window:globalThis);
