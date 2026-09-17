/* 얼굴 조정 — 브라우저 내 이미지 처리 (엔진 미연결 상태용)
   형태: MediaPipe Face Landmarker(478점)로 위치를 찾고 국소 워프(액상화 방식)로 변형
   피부: 피부색 영역만 표면 블러(엣지 보존)      톤: 밝기 · 색온도
   window.FaceAdjust = { detect(img), apply(img, params, maxSide) → canvas, DEFAULTS } */
(function(root){
'use strict';
const DEFAULTS={slim:0,jaw:0,eyeSize:0,eyeGap:0,nose:0,lips:0,smile:0,skin:0,detail:0,bright:0,warm:0};   // 각 -50 ~ +50 (피부 보정·디테일은 0~100)

/* ── 랜드마크 ─────────────────────────────────────────── */
let landmarker=null, loading=null, failed=false;
const CDN='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL='https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
async function getLandmarker(){
  if(landmarker)return landmarker; if(failed)return null;
  if(!loading)loading=(async()=>{try{
    const m=await import(CDN+'/vision_bundle.mjs');
    const fs=await m.FilesetResolver.forVisionTasks(CDN+'/wasm');
    landmarker=await m.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:MODEL},runningMode:'IMAGE',numFaces:1});
    return landmarker;}catch(e){console.warn('landmarker load failed, fallback to heuristic',e);failed=true;return null;}})();
  return loading;
}
/* 정면 헤드샷 비율 기반 근사(랜드마크 실패 시) */
function heuristic(w,h){const cx=w/2,fw=w*.42,fy=h*.44;return{
  faceW:fw,cx,eyeL:{x:cx-fw*.22,y:fy-fw*.08},eyeR:{x:cx+fw*.22,y:fy-fw*.08},eyeW:fw*.16,nose:{x:cx,y:fy+fw*.14},noseH:fw*.22,
  mouth:{x:cx,y:fy+fw*.42},mouthW:fw*.3,cornerL:{x:cx-fw*.15,y:fy+fw*.42},cornerR:{x:cx+fw*.15,y:fy+fw*.42},
  cheekL:{x:cx-fw*.5,y:fy+fw*.05},cheekR:{x:cx+fw*.5,y:fy+fw*.05},jawL:{x:cx-fw*.35,y:fy+fw*.55},jawR:{x:cx+fw*.35,y:fy+fw*.55},chin:{x:cx,y:fy+fw*.72},source:'heuristic'};}
function fromLandmarks(lm,w,h){
  const P=i=>({x:lm[i].x*w,y:lm[i].y*h}); const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2}); const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const eyeL=mid(P(33),P(133)), eyeR=mid(P(362),P(263));           // 화면 기준 좌/우
  const faceW=dist(P(234),P(454));
  return{faceW,cx:(P(234).x+P(454).x)/2,eyeL,eyeR,eyeW:Math.max(dist(P(33),P(133)),dist(P(362),P(263))),
    nose:P(1),noseH:dist(P(168),P(2)),mouth:mid(P(13),P(14)),mouthW:dist(P(61),P(291)),cornerL:P(61),cornerR:P(291),
    cheekL:P(234),cheekR:P(454),jawL:P(172),jawR:P(397),chin:P(152),source:'landmarks'};
}
async function detect(img){
  const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  const lmk=await getLandmarker();
  if(lmk){try{const r=lmk.detect(img);if(r&&r.faceLandmarks&&r.faceLandmarks[0])return fromLandmarks(r.faceLandmarks[0],w,h);const hz=heuristic(w,h);hz.source='noface';return hz;}catch(e){console.warn(e);}}
  return heuristic(w,h);
}

/* ── 워프 (역방향 매핑, 바이리니어) ────────────────────── */
/* controls: {cx,cy,r,type:'move',dx,dy} | {cx,cy,r,type:'scale',k}  k>0 확대 */
function warp(src,controls){
  const W=src.width,H=src.height;const sctx=src.getContext('2d');const sd=sctx.getImageData(0,0,W,H).data;
  const out=document.createElement('canvas');out.width=W;out.height=H;const octx=out.getContext('2d');octx.drawImage(src,0,0);
  const cs=controls.filter(c=>c.type==='scale'?Math.abs(c.k)>1e-4:Math.hypot(c.dx,c.dy)>.05);if(!cs.length)return out;
  let x0=W,y0=H,x1=0,y1=0;cs.forEach(c=>{x0=Math.min(x0,c.cx-c.r);y0=Math.min(y0,c.cy-c.r);x1=Math.max(x1,c.cx+c.r);y1=Math.max(y1,c.cy+c.r);});
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(W-1,Math.ceil(x1));y1=Math.min(H-1,Math.ceil(y1));
  const bw=x1-x0+1,bh=y1-y0+1;const od=octx.getImageData(x0,y0,bw,bh);const d=od.data;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    let sx=x,sy=y,touched=false;
    for(const c of cs){const dx=sx-c.cx,dy=sy-c.cy;const dd=(dx*dx+dy*dy)/(c.r*c.r);if(dd>=1)continue;const t=1-dd;const wgt=t*t;touched=true;
      if(c.type==='move'){sx-=c.dx*wgt;sy-=c.dy*wgt;}else{const f=1-c.k*wgt;sx=c.cx+dx*f;sy=c.cy+dy*f;}}
    if(!touched)continue;
    // bilinear
    const fx=Math.max(0,Math.min(W-1.001,sx)),fy=Math.max(0,Math.min(H-1.001,sy));const ix=fx|0,iy=fy|0,ax=fx-ix,ay=fy-iy;
    const i00=(iy*W+ix)*4,i10=i00+4,i01=i00+W*4,i11=i01+4;const o=((y-y0)*bw+(x-x0))*4;
    for(let ch=0;ch<3;ch++){d[o+ch]=(sd[i00+ch]*(1-ax)+sd[i10+ch]*ax)*(1-ay)+(sd[i01+ch]*(1-ax)+sd[i11+ch]*ax)*ay;}
  }
  octx.putImageData(od,x0,y0);return out;
}
function controlsFor(F,p){
  const s=v=>v/50; const fw=F.faceW; const c=[];
  if(p.slim){const k=s(p.slim)*fw*.05;c.push({type:'move',cx:F.cheekL.x,cy:F.cheekL.y,r:fw*.42,dx:k,dy:0},{type:'move',cx:F.cheekR.x,cy:F.cheekR.y,r:fw*.42,dx:-k,dy:0});}
  if(p.jaw){const k=s(p.jaw)*fw*.045;c.push({type:'move',cx:F.jawL.x,cy:F.jawL.y,r:fw*.34,dx:k*.6,dy:-k*.5},{type:'move',cx:F.jawR.x,cy:F.jawR.y,r:fw*.34,dx:-k*.6,dy:-k*.5},{type:'move',cx:F.chin.x,cy:F.chin.y,r:fw*.3,dx:0,dy:-k*.5});}
  if(p.eyeSize){const k=s(p.eyeSize)*.22;c.push({type:'scale',cx:F.eyeL.x,cy:F.eyeL.y,r:F.eyeW*1.35,k},{type:'scale',cx:F.eyeR.x,cy:F.eyeR.y,r:F.eyeW*1.35,k});}
  if(p.eyeGap){const k=s(p.eyeGap)*fw*.03;c.push({type:'move',cx:F.eyeL.x,cy:F.eyeL.y,r:F.eyeW*1.5,dx:-k,dy:0},{type:'move',cx:F.eyeR.x,cy:F.eyeR.y,r:F.eyeW*1.5,dx:k,dy:0});}
  if(p.nose){c.push({type:'scale',cx:F.nose.x,cy:F.nose.y-F.noseH*.15,r:F.noseH*1.2,k:s(p.nose)*.2});}
  if(p.lips){c.push({type:'scale',cx:F.mouth.x,cy:F.mouth.y,r:F.mouthW*.95,k:s(p.lips)*.22});}
  if(p.smile){const k=s(p.smile)*fw*.03;c.push({type:'move',cx:F.cornerL.x,cy:F.cornerL.y,r:F.mouthW*.55,dx:-k*.3,dy:-k},{type:'move',cx:F.cornerR.x,cy:F.cornerR.y,r:F.mouthW*.55,dx:k*.3,dy:-k});}
  return c;
}

/* ── 피부 보정 (피부색 마스크 + 엣지 보존 블러) ─────────── */
function skinSmooth(cv,amount){
  if(amount<=0)return cv;const W=cv.width,H=cv.height;const ctx=cv.getContext('2d');const orig=ctx.getImageData(0,0,W,H);
  const bl=document.createElement('canvas');bl.width=W;bl.height=H;const bctx=bl.getContext('2d');const px=Math.max(1.5,Math.min(W,H)/280*(0.6+amount/100*1.6));
  bctx.filter=`blur(${px}px)`;bctx.drawImage(cv,0,0);const blur=bctx.getImageData(0,0,W,H).data;
  const d=orig.data;const a=amount/100;const thr=28+a*30;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];
    const cb=128-0.168736*r-0.331264*g+0.5*b,cr=128+0.5*r-0.418688*g-0.081312*b;
    if(cb<77||cb>127||cr<133||cr>177)continue;                                   // 피부색 아님
    const soft=Math.min(1,Math.max(0,(Math.min(cb-77,127-cb,cr-133,177-cr))/12));  // 마스크 가장자리 부드럽게
    for(let ch=0;ch<3;ch++){const diff=blur[i+ch]-d[i+ch];if(Math.abs(diff)>thr)continue;d[i+ch]+=diff*a*soft*0.9;}}
  ctx.putImageData(orig,0,0);return cv;
}
/* ── 피부 디테일 (피부색 영역만 미세 결 강조: 하이패스 성분 되살리기) ── */
function skinDetail(cv,amount){
  if(amount<=0)return cv;const W=cv.width,H=cv.height;const ctx=cv.getContext('2d');const orig=ctx.getImageData(0,0,W,H);
  const bl=document.createElement('canvas');bl.width=W;bl.height=H;const bctx=bl.getContext('2d');const px=Math.max(1,Math.min(W,H)/600);   // 작은 반경 → 모공·결 스케일
  bctx.filter=`blur(${px}px)`;bctx.drawImage(cv,0,0);const blur=bctx.getImageData(0,0,W,H).data;
  const d=orig.data;const a=amount/100*1.6;const cap=22;                     // 큰 대비(윤곽·머리카락 경계)는 제한해 헤일로 방지
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];
    const cb=128-0.168736*r-0.331264*g+0.5*b,cr=128+0.5*r-0.418688*g-0.081312*b;
    if(cb<77||cb>127||cr<133||cr>177)continue;
    const soft=Math.min(1,Math.max(0,(Math.min(cb-77,127-cb,cr-133,177-cr))/12));
    for(let ch=0;ch<3;ch++){let hp=d[i+ch]-blur[i+ch];if(hp>cap)hp=cap;else if(hp<-cap)hp=-cap;d[i+ch]=Math.max(0,Math.min(255,d[i+ch]+hp*a*soft));}}
  ctx.putImageData(orig,0,0);return cv;
}
/* ── 톤 ───────────────────────────────────────────────── */
function tone(cv,bright,warm){
  if(!bright&&!warm)return cv;const ctx=cv.getContext('2d');const id=ctx.getImageData(0,0,cv.width,cv.height),d=id.data;
  const bB=bright/50*40,wR=warm/50*18,wB=-warm/50*18;
  for(let i=0;i<d.length;i+=4){d[i]=Math.max(0,Math.min(255,d[i]+bB+wR));d[i+1]=Math.max(0,Math.min(255,d[i+1]+bB));d[i+2]=Math.max(0,Math.min(255,d[i+2]+bB+wB));}
  ctx.putImageData(id,0,0);return cv;
}

/* ── 단계별 API (미리보기 캐시용) ─────────────────────── */
function baseCanvas(img,maxSide){const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;const k=maxSide?Math.min(1,maxSide/Math.max(w,h)):1;
  const cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);const g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,cv.width,cv.height);return {cv,k};}
function clone(cv){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d').drawImage(cv,0,0);return c;}
const SHAPE_KEYS=['slim','jaw','eyeSize','eyeGap','nose','lips','smile'];
/* ── 적용: img → canvas (maxSide로 축소 가능) ─────────── */
function scaleFeatures(F,k){const o={};for(const key in F){const v=F[key];o[key]=(v&&typeof v==='object')?{x:v.x*k,y:v.y*k}:(typeof v==='number'?v*k:v);}return o;}
async function apply(img,params,maxSide,features){
  const p=Object.assign({},DEFAULTS,params||{});
  const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;const k=maxSide?Math.min(1,maxSide/Math.max(w,h)):1;
  const cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);const g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,cv.width,cv.height);
  const F=scaleFeatures(features||await detect(img),k);
  let out=warp(cv,controlsFor(F,p));
  out=skinSmooth(out,p.skin);out=skinDetail(out,p.detail);out=tone(out,p.bright,p.warm);
  return out;
}
/* 얼굴 박스(픽셀): 랜드마크 기반, 실패 시 근사 */
async function faceBox(img){const F=await detect(img);const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  if(F.source==='landmarks'){const cx=(F.cheekL.x+F.cheekR.x)/2,cy=(F.eyeL.y+F.chin.y)/2;const size=Math.max(F.faceW,F.chin.y-Math.min(F.eyeL.y,F.eyeR.y)+F.faceW*.35);return {cx,cy,size,source:'landmarks'};}
  return {cx:F.cx,cy:F.eyeL.y+F.faceW*.25,size:F.faceW*1.1,source:F.source};}
root.FaceAdjust={DEFAULTS,SHAPE_KEYS,detect,faceBox,apply,baseCanvas,clone,scaleFeatures,warp,controlsFor,skinSmooth,skinDetail,tone};
})(typeof window!=='undefined'?window:globalThis);
