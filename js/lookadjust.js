/* 룩(전신·니샷·상체) 조정: 몸 비율(다리 길이·몸통 두께·어깨 너비)과 색(밝기·대비·채도·따뜻함·무드 프리셋).
   라이트그레이 배경의 룩북 컷을 전제로 인물 영역을 잡고, 행 단위 리샘플로 변형한다. DOM 의존 없음(canvas만). */
(function(root){
const DEFAULTS={leg:0,body:0,lower:0,shoulder:0,bright:0,contrast:0,sat:0,warm:0,mood:'none'};
const SLIDERS=[['grp','몸 비율'],['leg','다리 길이',-50,50],['body','몸통 두께',-50,50],['lower','하체 두께',-50,50],['shoulder','어깨 너비',-50,50],['grp','색·톤'],['bright','밝기',-50,50],['contrast','대비',-50,50],['sat','채도',-50,50],['warm','따뜻함',-50,50]];
/* 무드 프리셋: 대비·채도·따뜻함·페이드(블랙 리프트)·틴트 */
const MOODS={
  none:{ko:'없음',c:0,s:0,w:0,fade:0,tint:[0,0,0]},
  film:{ko:'따뜻한 필름',c:-6,s:-8,w:14,fade:14,tint:[6,2,-6]},
  clean:{ko:'쿨 클린',c:8,s:2,w:-10,fade:0,tint:[-2,0,6]},
  soft:{ko:'소프트 페이드',c:-14,s:-14,w:4,fade:26,tint:[3,2,2]},
  vivid:{ko:'비비드',c:14,s:26,w:2,fade:0,tint:[0,0,0]},
  mono:{ko:'모노톤',c:6,s:-100,w:0,fade:6,tint:[2,1,0]},
  editorial:{ko:'에디토리얼 매트',c:12,s:-20,w:-4,fade:18,tint:[2,0,-2]}
};
/* 인물 영역 분석: 테두리 배경색과 다른 픽셀의 bbox → 프레임별 어깨·힙 행 추정 */
function analyze(img,frame){const k=Math.min(1,700/Math.max(img.naturalWidth,img.naturalHeight));const W=Math.round(img.naturalWidth*k),H=Math.round(img.naturalHeight*k);
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0,W,H);const d=g.getImageData(0,0,W,H).data;
  const rs=[],gs=[],bs=[];for(let x=0;x<W;x+=3){for(const y of [0,1,H-1,H-2]){const o=(y*W+x)*4;rs.push(d[o]);gs.push(d[o+1]);bs.push(d[o+2]);}}for(let y=0;y<H;y+=3){for(const x of [0,1,W-1,W-2]){const o=(y*W+x)*4;rs.push(d[o]);gs.push(d[o+1]);bs.push(d[o+2]);}}
  const med=a=>{a.sort((p,q)=>p-q);return a[a.length>>1];};const br=med(rs),bg=med(gs),bb=med(bs);
  let x0=W,y0=H,x1=0,y1=0;const rowW=new Int32Array(H);
  for(let y=0;y<H;y++){let n=0;for(let x=0;x<W;x++){const o=(y*W+x)*4;const dd=Math.abs(d[o]-br)+Math.abs(d[o+1]-bg)+Math.abs(d[o+2]-bb);if(dd>60){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}rowW[y]=n;}
  if(x1<x0){x0=0;y0=0;x1=W-1;y1=H-1;}
  const h=y1-y0;const f=frame||'full';
  // 프레임별 비율: 정수리 기준 어깨·힙 위치 (룩북 정면 서기 기준 평균)
  const R={full:{sh:0.20,hip:0.50},knee:{sh:0.24,hip:0.62},bust:{sh:0.62,hip:1.0}}[f]||{sh:0.2,hip:0.5};
  return {k,bg:[br,bg,bb],bbox:{x:x0/k,y:y0/k,w:(x1-x0+1)/k,h:(y1-y0+1)/k},shoulderY:(y0+h*R.sh)/k,hipY:(y0+h*R.hip)/k,footY:(y1+1)/k,frame:f};}
const sstep=(a,b,t)=>{t=Math.min(1,Math.max(0,(t-a)/(b-a)));return t*t*(3-2*t);};
/* 기하 변형: 출력 픽셀 (x,y) → 소스 (sx,sy). 세로: 힙~발 구간을 L배로 늘리고 그 아래(바닥)는 아래로 밀림. 가로: 어깨/몸통 행을 중심 기준으로 폭 조절 */
function geometry(src,p,info,k){const W=src.width,H=src.height;const cx=(info.bbox.x+info.bbox.w/2)*k;
  const L=1+p.leg/100*0.30, B=1+p.body/100*0.30, Sh=1+p.shoulder/100*0.26, Lo=1+p.lower/100*0.30;
  if(p.leg===0&&p.body===0&&p.shoulder===0&&p.lower===0)return src;
  const hip=info.hipY*k,foot=info.footY*k,sh=info.shoulderY*k,top=info.bbox.y*k;const band=Math.max(8,(foot-top)*0.06);
  const out=document.createElement('canvas');out.width=W;out.height=H;const og=out.getContext('2d');
  const sd=src.getContext('2d').getImageData(0,0,W,H).data;const od=og.createImageData(W,H);const dd=od.data;
  const legLen=(foot-hip);const newFoot=hip+legLen*L;
  for(let y=0;y<H;y++){
    let sy;if(info.frame==='bust'||L===1||y<hip)sy=y;else if(y<newFoot)sy=hip+(y-hip)/L;else sy=y-(newFoot-foot);
    // 가로 배율: 어깨 밴드(sh 주변)와 몸통(sh~hip) 각각, 경계는 부드럽게
    let s=1;if(info.frame!=='bust'||true){const tSh=sstep(sh-band*1.5,sh+band*0.5,sy)*(1-sstep(hip-band,hip+band,sy));const tBody=sstep(sh+band*0.5,sh+band*2,sy)*(1-sstep(hip-band,hip+band*1.5,sy));
      // 어깨는 상단, 몸통은 그 아래; 두 배율을 부드럽게 섞음
      const tLow=sstep(hip-band,hip+band*1.5,sy)*(1-sstep(foot-band*2,foot+band*0.5,sy));
      const wSh=tSh*(1-tBody),wB=tBody;s=1+(Sh-1)*wSh+(B-1)*wB+(Lo-1)*tLow;}
    const syc=Math.min(H-1,Math.max(0,sy));const y0i=Math.floor(syc),y1i=Math.min(H-1,y0i+1),fy=syc-y0i;
    for(let x=0;x<W;x++){const sx=cx+(x-cx)/s;const sxc=Math.min(W-1,Math.max(0,sx));const x0i=Math.floor(sxc),x1i=Math.min(W-1,x0i+1),fx=sxc-x0i;
      const o=(y*W+x)*4;const a=(y0i*W+x0i)*4,b=(y0i*W+x1i)*4,c2=(y1i*W+x0i)*4,e=(y1i*W+x1i)*4;
      for(let ch=0;ch<3;ch++){const t1=sd[a+ch]*(1-fx)+sd[b+ch]*fx,t2=sd[c2+ch]*(1-fx)+sd[e+ch]*fx;dd[o+ch]=t1*(1-fy)+t2*fy;}dd[o+3]=255;}}
  og.putImageData(od,0,0);return out;}
/* 색 보정 */
function grade(cv,p){const m=MOODS[p.mood]||MOODS.none;const c=(p.contrast+m.c)/50,s=1+(p.sat+m.s)/50*0.6,w=(p.warm+m.w)/50*18,b=p.bright/50*40,fade=m.fade,tint=m.tint;
  if(!c&&s===1&&!w&&!b&&!fade&&!tint.some(Boolean))return cv;const g=cv.getContext('2d');const id=g.getImageData(0,0,cv.width,cv.height),d=id.data;const cf=1+c*0.6;
  for(let i=0;i<d.length;i+=4){let r=d[i],gg=d[i+1],bb=d[i+2];
    r=(r-128)*cf+128+b+w+tint[0];gg=(gg-128)*cf+128+b+tint[1];bb=(bb-128)*cf+128+b-w+tint[2];
    if(s!==1){const L=0.299*r+0.587*gg+0.114*bb;r=L+(r-L)*s;gg=L+(gg-L)*s;bb=L+(bb-L)*s;}
    if(fade){r=r+(fade)*(1-r/255);gg=gg+(fade)*(1-gg/255);bb=bb+(fade)*(1-bb/255);}
    d[i]=r<0?0:r>255?255:r;d[i+1]=gg<0?0:gg>255?255:gg;d[i+2]=bb<0?0:bb>255?255:bb;}
  g.putImageData(id,0,0);return cv;}
function base(img,maxSide){const w=img.naturalWidth,h=img.naturalHeight;const k=maxSide?Math.min(1,maxSide/Math.max(w,h)):1;const cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);const g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,cv.width,cv.height);return {cv,k};}
function clone(cv){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d').drawImage(cv,0,0);return c;}
async function apply(img,params,info,maxSide){const p=Object.assign({},DEFAULTS,params||{});const {cv,k}=base(img,maxSide);let out=geometry(cv,p,info,k);if(out===cv)out=clone(cv);return grade(out,p);}
const GEO_KEYS=['leg','body','lower','shoulder'];
root.LookAdjust={DEFAULTS,SLIDERS,MOODS,GEO_KEYS,analyze,geometry,grade,base,clone,apply};
})(typeof window!=='undefined'?window:globalThis);
