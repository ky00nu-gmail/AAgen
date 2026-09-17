/* GPT용 스킬 문서 생성: node tools/export-gpt-skill.js
   js/prompt.js의 결정적 템플릿·옵션 사전을 Markdown으로 내보낸다. ChatGPT(커스텀 GPT 지침 / 프로젝트 파일)나 Claude 스킬로 붙여 넣어,
   사진 + 한국어 옵션만 주면 이 앱과 같은 프롬프트가 나오게 하는 용도. 코드가 바뀌면 다시 실행해서 문서를 갱신한다. */
const fs=require('fs'),path=require('path');
const P=require('../js/prompt.js');
const out=[];const L=(...a)=>out.push(a.join(''));
const code=t=>L('```text\n'+t.trim()+'\n```\n');
const table=(head,rows)=>{L('| '+head.join(' | ')+' |');L('|'+head.map(()=>'---').join('|')+'|');rows.forEach(r=>L('| '+r.map(x=>String(x??'').replace(/\|/g,'\\|')).join(' | ')+' |'));L('');};
const dict=(title,obj,val=v=>Array.isArray(v)?v.join(' / '):v)=>{L(`**${title}**\n`);table(['표시 이름(KO)','프롬프트용 영어'],Object.entries(obj).map(([k,v])=>[k,val(v)]));};
const today=new Date().toISOString().slice(0,10);

L(`# AI 모델 만들기 — GPT 스킬 (프롬프트 규격서)\n`);
L(`생성일 ${today} · 원본 엔진 \`js/prompt.js\` · 이 문서는 \`node tools/export-gpt-skill.js\`로 자동 생성됨. 손으로 고치지 말고 코드 → 재생성.\n`);
L(`## 사용법 (GPT 지침으로 붙여 넣기)\n`);
L(`당신은 브랜드 룩북용 AI 모델 이미지를 만드는 프롬프트 빌더입니다. 사용자는 **사진을 첨부하고 한국어 옵션**만 말합니다. 당신은 아래 규격의 **영어 프롬프트를 글자 그대로 조립**해 이미지 도구를 호출합니다. 규칙:\n`);
L(`1. 옵션 사전에 있는 표시 이름은 반드시 대응 영어로 치환한다. 사전에 없는 값은 사용자가 준 문장을 \`Direction: "..."\` 자리에 넣는다.\n2. 비운 옵션은 문장에서 빼거나 "원본 유지/자동" 문구를 쓴다. 임의로 미화·포즈 변경·배경 변경을 추가하지 않는다.\n3. 고정 문단(정면 증명사진 자세, 라이트그레이 배경, 조명·피부 마감, 얼굴 동일성)은 절대 바꾸지 않는다.\n4. 한 메시지에서 이미지 도구는 **1회 = 1장 = 1캔버스**다. 여러 장이 필요하면 순서대로 여러 번 호출하고, 변주(n>1)·콜라주를 만들지 않는다.\n5. 결과를 돌려줄 때는 프롬프트 전문을 함께 보여 준다(사용자가 앱에 붙여 넣어 재현할 수 있게).\n`);

/* ---------------- A. 3단계 비교 ---------------- */
L(`\n## A. 내 얼굴 모델 — 3단계 비교 (그대로 · 약하게 · 글로우, 한 장 3패널)\n`);
L(`입력: 얼굴 사진 1장(Image 1). 출력: 가로로 3패널이 붙은 1장. 사용자는 패널 번호(1 KEEP · 2 NATURAL · 3 GLOW)를 골라 그 패널만 잘라 쓴다.\n`);
L(`**옵션(모두 선택)**: 성별, 신장, 헤어 스타일(여성/남성 목록 다름), 헤어 컬러, 눈 색, 피부톤, 메이크업, 타투, 디렉션. 인종·나이대는 사진 원본을 유지하므로 받지 않는다.\n`);
L(`### 템플릿 (옵션 없음 = 기준선)\n`);
code(P.comparePrompt({gender:'여성',hairColor:'',hairStyle:'',makeup:'',tattoo:'없음',direction:''}));
L(`### 예시 — 남성 · 178cm · 댄디컷 · 다크 브라운 · 디렉션 "살짝 미소"\n`);
code(P.comparePrompt({gender:'남성',height:178,hairColor:'다크 브라운',hairStyle:'댄디컷',makeup:'',tattoo:'없음',direction:'살짝 미소'}));
L(`### 단일 단계 프롬프트 (패널 대신 한 단계만 필요할 때)\n`);
for(const st of ['keep','light','glow']){L(`**${{keep:'그대로 (keep)',light:'약하게 (light)',glow:'글로우 (glow)'}[st]}**\n`);code(P.humanPrompt({selfie:true,strength:st,gender:'여성',hairColor:'',hairStyle:'',skin:'',eye:'',body:'',makeup:'',tattoo:'없음',direction:''}));}
L(`### 옵션 사전 — 얼굴 단계\n`);
dict('성별',P.EN.gender,v=>v[0]);
dict('헤어 스타일 · 여성',P.EN.hair);dict('헤어 스타일 · 남성',P.EN.hairM);dict('헤어 컬러',P.EN.hairc);dict('눈 색',P.EN.eye);dict('피부톤',P.EN.skin);dict('메이크업',P.EN.makeup);dict('타투 위치',P.EN.tattoo);dict('체형',P.EN.body);
L(`**신장** → \`${P.heightPhrase(160)}\` 형태. 값별 문구:\n`);table(['cm','문구'],[150,155,160,165,170,175,180,185,190,195].map(h=>[h,P.heightPhrase(h)]));

/* ---------------- B. 랜덤 모델 ---------------- */
L(`\n## B. 랜덤 모델 (참조 사진 없음 · 텍스트 생성)\n`);
L(`비운 옵션은 앱이 무작위로 채운다. GPT에서는 사용자가 말한 값만 넣고 나머지는 자연스럽게 정한다. 세로 3:4 또는 2:3.\n`);
L(`**인간 예시**\n`);code(P.humanPrompt({selfie:false,gender:'여성',eth:'동아시아',country:'대한민국',age:'20대 중반',body:'슬림',hairColor:'블랙',hairStyle:'긴 생머리',eye:'다크 브라운',skin:'밝은 톤',makeup:'내추럴',tattoo:'없음',direction:''}));
L(`**동물 예시**\n`);code(P.animalPrompt({species:'고양이',style:'실사',age:'성체',fur:'그레이',furLen:'짧은',eye:'그린',face:'호기심',acc:'없음',direction:''}));
L(`**애니 예시**\n`);code(P.animePrompt({gender:'여성',age:'20대',style:'한국 웹툰',hairC:'핑크',hair:'롱보브',eye:'퍼플',skin:'밝은 톤',outfit:'캐주얼',trait:'없음',direction:''}));
L(`### 옵션 사전 — 랜덤 모델\n`);
dict('인종',P.EN.eth);dict('국가',P.EN.country);dict('나이대',P.EN.age);
dict('동물 종',P.EN.species);dict('동물 스타일',P.EN.astyle);dict('동물 나이',P.EN.aage);dict('털 색',P.EN.fur);dict('털 길이',P.EN.furlen);dict('동물 눈',P.EN.aeye);dict('표정',P.EN.aface);dict('동물 소품',P.EN.aacc);
dict('애니 나이대',P.EN.nage);dict('애니 스타일',P.EN.nstyle);dict('애니 의상',P.EN.noutfit);dict('애니 특징',P.EN.ntrait);

/* ---------------- C. 룩 ---------------- */
L(`\n## C. 룩 (스타일링) — 상체 · 니샷 · 풀샷\n`);
L(`입력: 데뷔 모델 이미지 1장(Image 1). 의상 지정 모드면 Image 2~N이 의상 참조. **ChatGPT에서는 한 대화에서 아래 3개 메시지를 순서대로 보낸다**(한 메시지에 3장을 요구하면 같은 크롭의 변주만 나온다).\n`);
L(`프레이밍 확정값: 상체 = 머리 위 여백 있는 헤드샷(어깨 바로 아래 윗가슴까지, 얼굴이 높이의 40~45%) 1:1 · 니샷 = 머리~무릎 위(허벅지 중간) 1:1 · 풀샷 = 머리~신발+바닥 2:3.\n`);
const lf={mode:'compose',gender:'여성',preset:null,top:'셔츠',topColor:'화이트',bottom:'슬랙스',bottomColor:'베이지',outer:'없음',shoes:'로퍼',acc:['실버 목걸이'],direction:'',height:170,pose:'손을 앞에 모으고 서기'};
const lp=P.lookPrompts(lf);
L(`### C-1. ChatGPT 3단계 (예시 옵션: 여성 · 170cm · 화이트 셔츠 · 베이지 슬랙스 · 로퍼 · 실버 목걸이 · 포즈 "손을 앞에 모으고 서기")\n`);
lp.chatSteps.forEach((t,i)=>{L(`**${i+1}단계 · ${['상체 (모델 이미지 첨부)','니샷 (이어서)','풀샷 (이어서)'][i]}**\n`);code(t);});
L(`### C-2. API용 개별 프롬프트 (니샷·풀샷은 상체 결과를 Image 2로 참조)\n`);
const lp2=P.lookPrompts(Object.assign({},lf,{bustRef:true}));
L(`**상체**\n`);code(lp.bust);L(`**니샷 (Image 2 = 상체 결과)**\n`);code(lp2.knee);L(`**풀샷 (Image 2 = 상체 결과)**\n`);code(lp2.full);
L(`### C-3. 의상 지정 모드 (참조 이미지로 입히기) — 상체 예시, 참조 3장 + 디렉션\n`);
code(P.lookPrompts({mode:'garment',gender:'여성',refs:[1,2,3],direction:'하의는 와이드 데님, 스니커즈',height:170,pose:null}).bust);
L(`### 옵션 사전 — 룩\n`);
dict('프리셋',P.STYLE_EN.preset);dict('상의',P.STYLE_EN.top);dict('하의',P.STYLE_EN.bottom);dict('아우터',P.STYLE_EN.outer);dict('신발',P.STYLE_EN.shoes);dict('악세서리',P.STYLE_EN.acc);dict('색상',P.STYLE_EN.color);
L(`**포즈** (세 컷에 동일 적용 · 상체는 head-and-shoulders 프레임 표기 · 지정 안 함 = unspecified pose, 정면)\n`);
table(['표시 이름(KO)','몸 자세 영어','머리·시선 영어'],Object.entries(P.POSE_EN).map(([k,v])=>[k,v.body,v.head||'(기본: face toward the camera, head upright, eyes into the lens)']));

/* ---------------- D. 배경 ---------------- */
L(`\n## D. 배경 플레이트 (모델 없음)\n`);
L(`### D-1. 단일 배경 — 예시: 카페 · 골든아워 · 얕은 심도 · 아이레벨 35mm · 2:3 세로 · 디렉션 "따뜻한 우드 톤"\n`);
code(P.bgPrompt({scene:'카페',light:'골든아워',depth:'얕은 심도',camera:'아이레벨 35mm',aspect:'2:3 세로',direction:'따뜻한 우드 톤',refs:0}));
L(`참조 이미지가 있으면 첫 문단 앞에 \`Images 1 to N are reference photos of the location and mood. Recreate the same kind of space, materials, colors and atmosphere as a new, clean plate — do not copy them pixel for pixel.\`가 붙는다. 컬러 스튜디오는 \`single-color\`를 색 이름으로 치환.\n`);
L(`### D-2. 자유 탐색 (룩 이미지 첨부 · 개수·카테고리 자유)\n`);
code(P.bgFreePrompt({aspect:'2:3 세로',spec:'170cm · 화이트 셔츠 · 베이지 슬랙스'}));
L(`### 옵션 사전 — 배경\n`);
dict('장면',P.BG_EN.scene);dict('조명 · 시간대',P.BG_EN.light);dict('심도',P.BG_EN.depth);dict('카메라',P.BG_EN.camera);
L(`**비율** → 1:1 = 1024×1024 · 2:3 세로 = 1024×1536 · 3:2 가로 = 1536×1024\n`);
L(`**랜덤 디테일 풀(BG_TWIST)**: ${P.BG_TWIST.join(' · ')}\n`);

/* ---------------- E. 합성 ---------------- */
L(`\n## E. 룩 + 배경 합성\n`);
L(`입력: Image 1 = 룩, Image 2 = 배경(없으면 텍스트 장면). 모델·의상·포즈 100% 유지, 라이트그레이 배경만 교체.\n`);
L(`**풀샷 · 배경 이미지 있음 · 출력 룩과 동일**\n`);code(P.scenePrompt({frame:'full',hasBg:true,direction:''}));
L(`**상체 · 텍스트 장면(카페) · 출력 9:16 세로**\n`);code(P.scenePrompt({frame:'bust',hasBg:false,bgText:P.BG_EN.scene['카페'],ratio:'9:16 세로',direction:''}));
L(`**출력 비율 사전**\n`);table(['표시','프롬프트 문구','API 캔버스(가까운 것) → 센터 크롭'],Object.entries(P.OUT_RATIO).map(([k,v])=>[k,v.en,v.api]));

/* ---------------- F. 고정 문단 ---------------- */
L(`\n## F. 고정 문단 (참조)\n`);
L(`**정면 자세 고정(POSE_LOCK)**\n`);code(P.POSE_LOCK);
L(`**룩 얼굴 디테일(FACE_DETAIL)**\n`);code(P.FACE_DETAIL);
L(`**얼굴 보정 패스(FACE_FIX, 얼굴 크롭 1024² 재편집용)**\n`);code(P.FACE_FIX);
L(`**룩 배경·조명·피부·색(LOOK)**\n`);table(['키','문구'],Object.entries(P.LOOK).map(([k,v])=>[k,v]));

const full=out.join('\n');const dir=path.join(__dirname,'../docs/gpt-skill');
fs.writeFileSync(path.join(dir,'AI_model.md'),full);
// 커스텀 GPT 지침(8000자 제한)용 짧은 파일 + 흐름별 지식 파일
const parts=full.split(/\n(?=## )/);const head=parts[0];
const files={'A':'A-face-3stage.md','B':'B-random-model.md','C':'C-look.md','D':'D-background.md','E':'E-composite.md','F':'F-fixed-paragraphs.md'};
for(const sec of parts.slice(1)){const m=/^## ([A-F])\. /.exec(sec);if(m)fs.writeFileSync(path.join(dir,files[m[1]]),'# '+sec.slice(3));}
const instr=head.replace(/^# .*\n/,'# 지침 (커스텀 GPT Instructions에 붙여 넣기)\n')+`
## 흐름 선택
- 얼굴 사진 + "모델 만들어" → **A** (3단계 비교 1장). 패널 번호를 고르면 그 패널만 잘라 쓴다고 안내.
- 사진 없이 "랜덤 모델" → **B**.
- 모델 이미지 + 옷/코디 요청 → **C** (상체 → 니샷 → 풀샷, 메시지 3개로 한 장씩).
- "배경 만들어" → **D** (모델 없는 플레이트). 룩 이미지가 있으면 D-2 자유 탐색.
- 룩 + 배경 이미지 → **E** (합성, 출력 비율은 사용자가 말한 값).

## 지식 파일
템플릿·옵션 사전은 첨부한 A~F 파일에 있다. 프롬프트를 조립할 때 해당 파일의 템플릿을 열어 **글자 그대로** 쓰고 옵션만 치환한다.
`;
fs.writeFileSync(path.join(dir,'INSTRUCTIONS.md'),instr);
console.log('files:',fs.readdirSync(dir).join(', '),'| INSTRUCTIONS chars:',instr.length);
console.log('written docs/gpt-skill/AI_model.md',out.join('\n').length,'chars');
