/* 검증용 프롬프트 매트릭스 생성: node tools/sample-prompts.js > docs/prompt-samples.md
   GPT Image-2에 그대로 붙여 넣어 옵션·디렉션이 어떻게 반영되는지 실제 결과로 확인하는 용도 */
const P=require('../js/prompt.js');
const H=(n,t)=>console.log(`\n${'#'.repeat(n)} ${t}\n`);
const code=t=>console.log('```\n'+t+'\n```');
console.log('# 프롬프트 검증 매트릭스\n\n생성일: '+new Date().toISOString().slice(0,10)+' · 엔진: `js/prompt.js`\n\n각 프롬프트는 **같은 얼굴 사진 1장**을 입력 이미지로 넣고 GPT Image-2 편집(Edit)으로 생성한다. 세로(3:4 또는 2:3), quality high. 결과는 `index.html`의 해당 후보 카드에 올려 비교한다.\n\n체크 포인트\n- 그대로: 옵션(헤어 컬러·피부톤)을 적용해도 얼굴 일관성이 유지되는가. 깨지면 그대로에서는 피부톤·눈 색 옵션을 막는 것을 검토\n- 약하게: 하이키 조명·광채 피부가 보이면서 본인으로 인식되는가\n- 글로우: 도자기 윤기와 모공·결이 함께 보이는가, 배경이 라이트그레이로 유지되는가\n- 디렉션: 자세·배경을 바꾸지 않고 무드·표정·소품에만 반영되는가');
const base={selfie:true,gender:'여성',hairColor:'',hairStyle:'',skin:'',eye:'',body:'',makeup:'',tattoo:'없음',direction:''};
const cases=[
  ['A. 옵션 없음 (기준선)',{}],
  ['B. 헤어 옵션 — 블론드 단발',{hairColor:'블론드',hairStyle:'단발'}],
  ['C. 피부톤·눈 색 옵션 — 도자기빛, 그레이',{skin:'도자기빛',eye:'그레이'}],
  ['D. 메이크업·타투 — 에디토리얼, 쇄골',{makeup:'에디토리얼',tattoo:'쇄골'}],
  ['E. 디렉션 — "부드러운 미소, 은은한 노을빛 무드"',{direction:'부드러운 미소, 은은한 노을빛 무드'}],
  ['F. 디렉션이 규칙과 충돌 — "고개를 옆으로 돌리고 카페 배경" (자세·배경 고정이 이기는지)',{direction:'고개를 옆으로 돌리고 카페 배경'}],
];
H(2,'1. 셀피 → 3단계');
for(const [title,over] of cases){
  H(3,title);
  for(const st of ['keep','light','glow']){
    H(4,{keep:'그대로',light:'약하게',glow:'글로우'}[st]);
    code(P.humanPrompt(Object.assign({},base,over,{strength:st})));
  }
}
H(2,'2. 3단계 비교 (한 장 3패널)');
code(P.comparePrompt({gender:'여성',hairColor:'',hairStyle:'',makeup:'',tattoo:'없음',direction:''}));
H(3,'옵션 포함 — 블론드 단발 + 디렉션 "미소"');
code(P.comparePrompt({gender:'여성',hairColor:'블론드',hairStyle:'단발',makeup:'',tattoo:'없음',direction:'미소'}));
H(2,'3. 랜덤 모델 (참조 사진 없음, 텍스트 생성)');
H(3,'인간');
code(P.humanPrompt({selfie:false,gender:'남성',eth:'동아시아',country:'대한민국',age:'20대 초반',body:'슬림',hairColor:'블랙',hairStyle:'슬릭백',eye:'다크 브라운',skin:'밝은 톤',makeup:'',tattoo:'없음',direction:''}));
H(3,'동물 — 실사');
code(P.animalPrompt({species:'고양이',style:'실사',age:'성체',fur:'그레이',furLen:'짧은',eye:'그린',face:'호기심',acc:'없음',direction:''}));
H(3,'동물 — 3D 캐릭터');
code(P.animalPrompt({species:'강아지',style:'3D 캐릭터',age:'아기',fur:'크림',furLen:'컬리',eye:'브라운',face:'미소',acc:'리본',direction:''}));
H(3,'애니');
code(P.animePrompt({gender:'여성',age:'20대',style:'한국 웹툰',hairC:'핑크',hair:'롱보브',eye:'퍼플',skin:'밝은 톤',outfit:'캐주얼',trait:'고양이 귀',direction:''}));
