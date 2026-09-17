/* 이미지 생성 엔진 어댑터 — OpenAI Images API (브라우저 직접 호출)
   window.ImageEngine = { edit(opts), generate(opts) } → 결과 data URL
   opts: { apiKey, model, prompt, size, quality, inputFidelity, imageDataUrl, signal, onStatus }
   ※ 내부용: API 키는 호출자가 localStorage에 보관한다. 외부 배포 시에는 프록시 서버로 옮길 것. */
(function(root){
'use strict';
const API='https://api.openai.com/v1';
function dataUrlToBlob(dataUrl){const [h,b64]=dataUrl.split(',');const mime=(h.match(/data:(.*?);/)||[])[1]||'image/jpeg';const bin=atob(b64);const u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return new Blob([u8],{type:mime});}
async function toPng(dataUrl){ // edits 입력은 png/jpg/webp 허용. 용량 제한(25MB) 대비 최대 2048px로 축소
  return new Promise(res=>{const im=new Image();im.onload=()=>{const k=Math.min(1,2048/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>res(b),'image/png');};im.src=dataUrl;});
}
async function call(path,body,o){
  let r;try{r=await fetch(API+path,{method:'POST',headers:body instanceof FormData?{Authorization:'Bearer '+o.apiKey}:{Authorization:'Bearer '+o.apiKey,'Content-Type':'application/json'},body,signal:o.signal});}
  catch(e){if(e.name==='AbortError')throw e;throw new Error('OpenAI에 요청이 도달하지 못했어요(네트워크·브라우저 차단·확장 프로그램). 일반 Chrome 창에서 열어 다시 시도하거나, 프록시 서버를 통해 호출하세요');}
  const txt=await r.text();let j={};try{j=JSON.parse(txt);}catch(e){}
  if(!r.ok){const m=(j.error&&j.error.message)||txt||('HTTP '+r.status);throw new Error(r.status===401?'API 키가 올바르지 않아요. 설정에서 확인하세요':r.status===429?'요청 한도 초과 또는 크레딧 부족: '+m:m);}
  const d=j.data&&j.data[0];if(!d)throw new Error('응답에 이미지가 없어요');
  if(d.b64_json)return 'data:image/png;base64,'+d.b64_json;
  if(d.url){const ir=await fetch(d.url);const bl=await ir.blob();return new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(bl);});}
  throw new Error('알 수 없는 응답 형식');
}
/* 얼굴 사진을 입력으로 편집 (내 얼굴 모델) */
async function edit(o){
  if(!o.apiKey)throw new Error('API 키가 없어요. 헤더의 "API 설정"에서 입력하세요');
  o.onStatus&&o.onStatus('입력 이미지 준비 중…');
  const png=await toPng(o.imageDataUrl);
  const fd=new FormData();fd.append('model',o.model||'gpt-image-1');fd.append('image',png,'face.png');fd.append('prompt',o.prompt);
  fd.append('size',o.size||'1536x1024');if(o.quality)fd.append('quality',o.quality);if(o.inputFidelity)fd.append('input_fidelity',o.inputFidelity);fd.append('n','1');
  o.onStatus&&o.onStatus('GPT Image 생성 중… (30~90초)');
  return call('/images/edits',fd,o);
}
/* 텍스트만으로 생성 (랜덤 모델) */
async function generate(o){
  if(!o.apiKey)throw new Error('API 키가 없어요. 헤더의 "API 설정"에서 입력하세요');
  o.onStatus&&o.onStatus('GPT Image 생성 중… (30~90초)');
  const body=JSON.stringify({model:o.model||'gpt-image-1',prompt:o.prompt,size:o.size||'1024x1536',quality:o.quality||'high',n:1});
  return call('/images/generations',body,o);
}
root.ImageEngine={edit,generate,dataUrlToBlob};
})(typeof window!=='undefined'?window:globalThis);
