/* AI 모델 만들기 — 프롬프트 엔진 (GPT Image-2)
   DOM 의존 없음. 브라우저에서는 window.PromptEngine, Node에서는 module.exports.
   규칙(2026-09-08 확정):
   - 첫 문장은 "어떤 사진인가" 앵커. 부정 목록·texture/detail/sharp 어휘는 본문에 넣지 않는다.
   - 세 단계 모두 자세·머리 각도·시선·프레이밍은 입력 사진 고정(POSE_LOCK), 배경은 항상 라이트그레이.
   - 그대로(keep)=편집 지시문+얼굴 100% 고정+선택 옵션만 / 약하게(light)=재촬영, 얼굴 유지, 하이키 뷰티광+광채 피부 /
     글로우(glow)=재해석, 얼굴 이상화 허용, wet-look 도자기 글래스 스킨(모공·결 보존), 클린 K-뷰티 메이크업. */
(function(root){
'use strict';
/* 한글 옵션 → 영문 프롬프트 어휘 */
const EN={
  gender:{'여성':['woman','she','her'],'남성':['man','he','his']},
  eth:{'동아시아':'East Asian','동남아시아':'Southeast Asian','유럽':'European','북미':'North American','아프리카':'African','아프리카계':'Black','히스패닉':'Hispanic','중동':'Middle Eastern','혼혈':'mixed-heritage'},
  country:{'대한민국':'Korean','일본':'Japanese','중국':'Chinese','대만':'Taiwanese','몽골':'Mongolian','홍콩':'Hong Kong','태국':'Thai','베트남':'Vietnamese','필리핀':'Filipino','인도네시아':'Indonesian','말레이시아':'Malaysian','싱가포르':'Singaporean','프랑스':'French','독일':'German','영국':'British','이탈리아':'Italian','스페인':'Spanish','스웨덴':'Swedish','미국':'American','캐나다':'Canadian','케냐':'Kenyan','나이지리아':'Nigerian','가나':'Ghanaian','에티오피아':'Ethiopian','남아공':'South African','브라질':'Brazilian','멕시코':'Mexican','콜롬비아':'Colombian','아르헨티나':'Argentine','UAE':'Emirati','튀르키예':'Turkish','이란':'Iranian','레바논':'Lebanese'},
  age:{'20대 초반':'early twenties','20대 중반':'mid twenties','20대 후반':'late twenties','30대 초반':'early thirties','30대 중반':'mid thirties','30대 후반':'late thirties','40대':'forties','50대':'fifties','60대':'sixties','70대':'seventies'},
  body:{'슬림':'a slim build','애슬레틱':'an athletic build','근육질':'a muscular build','볼륨감':'a curvy, full-figured build','아담한':'a petite frame'},
  hair:{'긴 생머리':'long straight hair','긴 레이어드':'long layered hair','긴 웨이브':'long wavy hair','미디엄 생머리':'medium-length straight hair','롱보브':'a long bob','단발':'a bob cut','짧은 단발':'a short bob','픽시컷':'a pixie cut','커튼뱅':'curtain bangs framing the face','옆가르마':'a side part','가운데 가르마':'a center part','포니테일':'a ponytail','로우번':'a low bun','내추럴 업두':'a loose natural updo','웻룩':'slicked wet-look hair','부드러운 컬':'soft curls','타이트 컬':'tight curls','땋은 머리':'braided hair','슬릭백':'hair slicked straight back','울프컷':'a shaggy wolf cut'},
  hairM:{'지정 안 함':'','자연스러운 숏컷':'natural short haircut','댄디컷':'neat Korean dandy cut','쉐도우펌':'soft Korean shadow perm','가르마펌':'Korean side-part perm','5:5 센터파트':'center-parted Korean hairstyle','리프컷':'Korean leaf cut with softly parted fringe','시스루뱅':'wispy see-through bangs','투블럭':'Korean two-block haircut','아이비리그컷':'Korean-style Ivy League haircut','크롭컷':'textured crop haircut','페이드컷':'clean fade haircut with textured top','콤마헤어':'Korean comma hairstyle','포마드 / 슬릭백':'slicked-back pompadour hairstyle','웨이브펌':'soft wavy Korean perm','히피펌':'messy Korean hippie perm','울프컷(남)':'Korean layered wolf cut','장발':"medium-to-long layered men's hair",'헝클어진 머리':'messy tousled hair with natural volume'},
  hairc:{'블랙':'black','다크 브라운':'dark brown','라이트 브라운':'light brown','허니 브라운':'honey brown','체스트넛':'chestnut','블론드':'blonde','애쉬 블론드':'ash blonde','플래티넘':'platinum blonde','스트로베리':'strawberry blonde','레드':'red','어번':'auburn','코퍼':'copper','애쉬 그레이':'ash gray','실버':'silver','옴브레':'ombré','발레아쥬':'balayage','핑크':'pastel pink','라벤더':'lavender','블루블랙':'blue-black','민트':'mint','스카이블루':'sky blue','퍼플':'purple','화이트':'white'},
  eye:{'다크 브라운':'dark brown eyes','라이트 브라운':'light brown eyes','헤이즐':'hazel eyes','그린':'green eyes','블루':'blue eyes','그레이':'gray eyes','오드아이':'heterochromia, each eye a different color','브라운':'brown eyes','레드':'red eyes','골드':'golden eyes','퍼플':'purple eyes','핑크':'pink eyes','민트':'mint-green eyes','앰버':'amber eyes'},
  skin:{'도자기빛':'porcelain skin','밝은 톤':'light skin','올리브':'olive skin','탠':'tan skin','카라멜':'caramel skin','딥':'deep, richly toned skin'},
  makeup:{'없음':'no makeup','내추럴':'natural, barely-there makeup','에디토리얼':'editorial makeup with a defined eye','글래머':'full glam makeup'},
  tattoo:{'쇄골':'a small fine-line tattoo on the collarbone','목 옆':'a small tattoo on the side of the neck','귀 뒤':'a tiny tattoo behind the ear','어깨':'a tattoo on the shoulder','가슴':'a tattoo across the upper chest','등 위쪽':'a tattoo on the upper back','팔뚝':'a tattoo on the forearm'},
  species:{'강아지':'dog','고양이':'cat','토끼':'rabbit','여우':'fox','곰':'bear','판다':'panda','호랑이':'tiger','사자':'lion','햄스터':'hamster','앵무새':'parrot'},
  astyle:{'실사':'a photorealistic photograph','3D 캐릭터':'a polished 3D character render in a Pixar-like style','일러스트':'a soft digital illustration'},
  aage:{'아기':'baby','어린':'young','성체':'adult'},
  fur:{'화이트':'white','크림':'cream','골든':'golden','브라운':'brown','블랙':'black','그레이':'gray','오렌지':'orange','얼룩':'white-and-dark patched','삼색':'calico tricolor'},
  furlen:{'짧은':'short','보통':'medium-length','긴':'long','컬리':'curly'},
  aface:{'무표정':'a calm, neutral expression','미소':'a gentle smiling expression','장난스러운':'a playful expression','졸린':'a sleepy expression','호기심':'a curious, alert expression'},
  aacc:{'리본':'a small ribbon','스카프':'a knitted scarf','안경':'tiny round glasses','모자':'a small hat','목걸이':'a slim collar necklace','꽃':'a flower tucked by the ear'},
  nage:{'10대':'teens','20대':'twenties','30대':'thirties','나이 불명':null},
  nstyle:{'일본 애니':'Japanese anime style with clean line art and cel shading','한국 웹툰':'Korean webtoon style with soft shading and clean lines','2.5D':'a semi-realistic 2.5D anime style','픽셀아트':'detailed pixel art','수채화':'a watercolor illustration style'},
  noutfit:{'교복':'a school uniform','캐주얼':'casual streetwear','판타지':'a fantasy adventurer outfit','SF':'a sleek sci-fi suit','전통 의상':'traditional dress','아이돌':'a stage idol costume','메이드·집사':'a maid or butler uniform'},
  aeye:{'브라운':'warm brown eyes','앰버':'amber eyes','그린':'green eyes','블루':'blue eyes','헤이즐':'hazel eyes','오드아이':'heterochromia, each eye a different color'},
  ntrait:{'고양이 귀':'cat ears','안경':'glasses','뿔':'small horns','날개':'wings','엘프 귀':'elf ears','흉터':'a small scar across one cheek','안대':'an eyepatch'},
};
/* 셀피 모드는 "새 사진 생성"이 아니라 "첨부 사진 편집" 지시문으로 쓴다.
   앞부분에 동일 인물 유지 규칙을 두고, 바꿀 것만 번호로 나열한다. 얼굴 묘사는 하지 않는다(다시 그리게 만든다). */
const POSE_LOCK='Pose: a straight-on frontal ID-photo pose regardless of the angle in the input — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, head-and-shoulders framing centered. If the input photo is taken from an angle or the head is tilted, rotate the person to this frontal pose while keeping every facial feature and proportion faithful to them.';
const STRENGTH_EN={
  keep:{
    lead:'Edit the attached photo into an ID-photo-style studio portrait of the same real person. Keep their identity 100% identical to the input image — the exact same face shape, eyes, eyebrows, nose, lips, teeth, skin texture, moles and marks, hairline and apparent age. Do not beautify, slim, retouch, smooth, symmetrize or idealize the face. '+POSE_LOCK+' Keep a similar neutral expression. This is the photo as it is, aligned to a frontal ID-photo pose, with only the selected styling options applied.',
    allow:'Look reference: soft, flat, even studio light with almost no shadow; the skin exactly as in the photo with its natural sheen and texture; no makeup added; hair as it naturally falls in the photo; a plain black camisole top; neutral, true-to-life color.',
    tail:'The result must look like a passport photo of this exact person taken straight-on, restyled only where requested — not a lookalike and not a more attractive version.'},
  light:{
    lead:'Re-shoot the person in the attached photo as a clean commercial headshot, as if a professional photographer, makeup artist and hair stylist worked on them for a brand lookbook. They must stay recognizable — same eye shape, nose, lips, face type, skin tone and apparent age. '+POSE_LOCK+' Within that fixed pose, this is a NEW photo, not a copy of the input: change the lighting, hair styling, makeup, skin finish and expression nuance freely.',
    allow:'Look reference: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes — noticeably brighter and cleaner than the input; skin retouched to a luminous, even, dewy finish with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, while fine pores and natural skin grain stay visible; clean natural makeup with light definition (even luminous base, softly shaped brows, subtly defined lashes, a natural rosy lip tint); hair freshly styled with light volume, shine and a little airy texture; a fitted black crew-neck tee or camisole; a clean, bright, slightly cool color grade. The face may be gently refined — a slightly cleaner jawline, brighter and more open eyes.',
    tail:'The result should look clearly more attractive and professional than the original — a model headshot — while a friend would still say "that\'s them".'},
  glow:{
    lead:'Re-imagine the person in the attached photo as a top K-beauty fashion model in a clean high-key studio beauty shot, as photographed for a premium cosmetics or fashion brand. '+POSE_LOCK+' Everything except the pose may be transformed boldly: idealize the face substantially into an editorial model version — sharper, more sculpted bone structure, perfected proportions and symmetry, larger luminous eyes, fuller defined lips, flawless skin. Only a faint resemblance to the input needs to remain (the general face type and hair color). This must look like a completely different, far more polished photograph, not an edit of the input.',
    allow:'Look reference: bright high-key frontal beauty light with minimal shadows and a clean catchlight in the eyes, on a near-white light-gray backdrop; porcelain glass skin at its most perfect — flawless, perfectly even tone with a wet-look luster and dewy highlights along the cheekbones, nose bridge, brow bone and cupid\'s bow — yet with fine pores, natural skin grain and subtle micro-texture clearly preserved so it reads as real skin under a macro lens, never plastic, waxy or airbrushed; clean editorial K-beauty makeup — softly defined eyes with subtle liner and lashes, groomed straight brows, delicate contour, a rosy pink lip tint — refined rather than dramatic; hair restyled with airy volume, glossy texture and softly tousled movement at the ends, possibly a different parting or shape; a black crew-neck tee; a clean, bright, slightly cool color grade with neutral whites, the skin glowing against the light-gray backdrop.',
    tail:'The result must be dramatically more polished than the original — unmistakably a premium beauty-campaign model — with only a faint echo of the original person, and the pose exactly as in the input.'},
};

/* ── 공용 룩 (2026-09-08 확정) ─────────────────────────────
   배경은 항상 flat near-white light-gray. 조명·피부는 단계별 Look reference를 따른다. */
const LOOK={
  backdrop:'a seamless, flat, near-white light-gray studio backdrop',
  keyLight:'bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes',
  skin:'luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, while fine pores and natural skin grain stay visible',
  grade:'a clean, bright, slightly cool color grade with neutral whites',
  top:'a plain black crew-neck tee',
};
const S_=x=>x?x.trim().replace(/[.。]?$/,'. '):'';
const join=a=>a.filter(Boolean).join(', ');
const aOrAn=w=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
const cap=x=>x?x.charAt(0).toUpperCase()+x.slice(1):x;
const hairEn=style=>style?(EN.hair[style]!==undefined?EN.hair[style]:EN.hairM[style]):undefined;
const hairPhrase=(style,color)=>{const st=hairEn(style);if(st)return color?st.replace(/^(an? )?(.*)$/,(m,a,rest)=>(a||'')+EN.hairc[color]+' '+rest):st;return color?EN.hairc[color]+' hair':'';};
/* 디렉션은 자세·배경 고정 규칙 안에서만 반영 */
const directionLine=(d,scope)=>d&&d.trim()?`Additional direction${scope?' ('+scope+')':''}: ${d.trim()}`:'';
const DIR_SCOPE='applies to mood, expression nuance, styling and props only — it must not change the pose or the light-gray backdrop';

/* ── 인간 ───────────────────────────────────────────────── */
function humanPrompt(f){
  const g=EN.gender[f.gender]||['person','they','their'];
  const st=f.strength;
  const hair=hairPhrase(f.hairStyle,f.hairColor);
  const styling=[];
  if(hair)styling.push((f.selfie?'hair styled as ':'with ')+hair);
  if(f.makeup&&f.makeup!=='없음')styling.push(EN.makeup[f.makeup]);
  if(f.tattoo&&f.tattoo!=='없음')styling.push(EN.tattoo[f.tattoo]);
  const refine=[];
  if(f.skin)refine.push(EN.skin[f.skin]); if(f.eye)refine.push(EN.eye[f.eye]); if(f.body)refine.push(EN.body[f.body]);

  if(f.selfie){
    const R=STRENGTH_EN[st];
    const changes=st==='glow'?[
      'background: '+LOOK.backdrop,
      'clothing: '+LOOK.top,
      'lighting: bright high-key frontal beauty light with minimal shadows and a clean catchlight',
      'framing: head-and-shoulders, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens',
    ]:st==='light'?[
      'background: '+LOOK.backdrop,
      'clothing: a fitted black crew-neck tee or camisole',
      'lighting: '+LOOK.keyLight,
      'framing: head-and-shoulders, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens',
    ]:[
      'background: '+LOOK.backdrop,
      'clothing: a plain black camisole top',
      'lighting: soft, flat, even studio light, cleaned up to natural exposure',
      'framing: head-and-shoulders at eye level, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens',
    ];
    // 선택 항목. 그대로(keep)에서는 "의도된 변경은 선택 항목만"으로 명시해 미화 금지 문장과 충돌하지 않게 한다
    const opts=[];
    if(hair)opts.push('hair styling: '+hair+(st==='keep'?' (hairline and face unchanged)':''));
    if(f.makeup&&f.makeup!=='없음')opts.push('makeup: '+EN.makeup[f.makeup]);
    if(f.tattoo&&f.tattoo!=='없음')opts.push('add '+EN.tattoo[f.tattoo]);
    if(refine.length)opts.push((st==='keep'?'selected appearance options (apply literally, without otherwise altering the face): ':st==='glow'?'push toward: ':'adjust toward: ')+join(refine));
    changes.push(...opts);
    const list=(st==='keep'?'Make only these changes: ':'Set the scene as follows and change everything else freely: ')+changes.map((c,i)=>`(${i+1}) ${c}`).join('; ')+'.';
    const look=st==='glow'?'Photorealistic, premium beauty-campaign quality: porcelain-luminous, flawless skin with fine pores and natural grain still visible, clean bright tones, the eyes in precise focus, a polished premium finish.'
      :st==='light'?'Photorealistic, clean commercial headshot quality: luminous, evenly retouched skin with real texture, clean bright tones, the face in precise focus.'
      :'Photorealistic result with natural-looking skin, an even healthy tone and a soft matte finish; clean, high-fidelity, the face in precise focus.';
    return [S_(R.lead)+S_(R.allow), S_(list)+S_(R.tail), S_(look)+S_(directionLine(f.direction,DIR_SCOPE))+'Vertical portrait framing, 3:4 aspect ratio, same output size as the input.'].map(x=>x.trim()).filter(Boolean).join('\n\n');
  }

  // 랜덤 모델(참조 사진 없음) — 확정 룩(약하게 기준: 하이키 정면 뷰티광, 광채 피부, 클린 내추럴 메이크업)
  const nat=f.country?EN.country[f.country]:(f.eth&&EN.eth[f.eth])||'';
  const anchor=`A clean commercial model headshot for a premium beauty and fashion brand's model sheet, photographed in a studio with ${LOOK.keyLight}, on ${LOOK.backdrop}.`;
  const subject=`The model is ${aOrAn([nat,g[0]].filter(Boolean).join(' '))} in ${g[2]} ${EN.age[f.age]||'twenties'}, ${join([...refine,...styling.filter(Boolean).map(x=>x.replace(/^with /,''))])}`;
  const makeupDefault=(f.makeup&&f.makeup!=='없음')?'':'clean natural makeup with light definition (even luminous base, softly shaped brows, subtly defined lashes, a natural rosy lip tint); ';
  const wardrobe=`${cap(g[1])} wears ${LOOK.top}; head-and-shoulders framing at eye level, facing the camera squarely with a composed, camera-ready expression. ${makeupDefault?cap(makeupDefault)+LOOK.skin:cap(LOOK.skin)}; ${LOOK.grade}.`;
  const quality='Photorealistic, clean commercial headshot quality: a clean, high-fidelity image with smooth tonal gradients and the face in precise focus.';
  return [S_(anchor)+S_(subject), S_(wardrobe)+S_(quality), S_(directionLine(f.direction,'mood, expression and styling only — keep the frontal pose and the light-gray backdrop'))+'Vertical portrait framing, 3:4 aspect ratio.'].map(x=>x.trim()).filter(Boolean).join('\n\n');
}

/* ── 동물 ───────────────────────────────────────────────── */
function animalPrompt(f){
  const style=EN.astyle[f.style]||EN.astyle['실사'];
  const who=aOrAn([EN.aage[f.age],EN.fur[f.fur],EN.furlen[f.furLen]+'-haired',EN.species[f.species]].filter(Boolean).join(' '));
  const anchor=f.style==='실사'
    ?`A clean commercial pet-model portrait of ${who} for a premium pet brand's model sheet, photographed in a studio with ${LOOK.keyLight.replace(' in the eyes','')}, on ${LOOK.backdrop}.`
    :`${cap(style)} of ${who}, designed as a brand mascot model sheet, clean and centered on ${LOOK.backdrop}.`;
  const look=join([EN.aeye[f.eye]||(f.eye?EN.eye[f.eye]||f.eye:''),EN.aface[f.face],f.acc&&f.acc!=='없음'?'wearing '+EN.aacc[f.acc]:'']);
  const scene='Sitting squarely and facing the camera, framed from the chest up at eye level.';
  const quality=f.style==='실사'?`Natural, healthy, glossy fur with realistic sheen and individual strands visible; ${LOOK.grade}; a clean, high-fidelity image with the eyes in precise focus.`:'Clean shapes, soft gradients and appealing proportions; bright, clean colors; the eyes clearly in focus.';
  return [S_(anchor)+S_(cap(look)), S_(scene)+S_(quality), S_(directionLine(f.direction,'mood, expression and props only — keep the frontal pose and the light-gray backdrop'))+'Vertical portrait framing, 3:4 aspect ratio.'].map(x=>x.trim()).filter(Boolean).join('\n\n');
}

/* ── 애니 ───────────────────────────────────────────────── */
function animePrompt(f){
  const g=EN.gender[f.gender]||['character','they','their'];
  const style=EN.nstyle[f.style]||EN.nstyle['일본 애니'];
  const hair=hairPhrase(f.hair,f.hairC)||'styled hair';
  const ageEn=EN.nage[f.age];
  const anchor=`A character portrait in ${style}, drawn as a brand mascot model sheet: a ${g[0]}${ageEn?` in ${g[2]} ${ageEn}`:' of ambiguous age'}.`;
  const look=join(['with '+hair,EN.eye[f.eye],EN.skin[f.skin],'wearing '+EN.noutfit[f.outfit],f.trait&&f.trait!=='없음'?'with '+EN.ntrait[f.trait]:'']);
  const scene='Bust-up composition facing the viewer squarely with a calm, confident expression, on a plain flat light-gray background with bright, soft, even lighting and a clean catchlight in the eyes; clean line work, luminous even skin shading and consistent proportions suitable for a reference sheet.';
  return [S_(anchor)+S_(cap(look)), S_(scene), S_(directionLine(f.direction,'mood, expression and props only — keep the frontal pose and the light-gray background'))+'Vertical portrait framing, 3:4 aspect ratio.'].map(x=>x.trim()).filter(Boolean).join('\n\n');
}

function comparePrompt(f){
  const g=EN.gender[f.gender]||['person','they','their'];
  const hair=hairPhrase(f.hairStyle,f.hairColor);
  const head=`Edit the attached photo into ONE single wide image split into three equal vertical panels, side by side, separated by thin white gutters. All three panels show the same real ${g[0]} from the input image in the SAME straight-on frontal ID-photo pose — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, identical head-and-shoulders framing in every panel. Even if the input photo is angled or tilted, every panel is rotated to this frontal pose while keeping the facial features faithful. What changes between panels is only styling, lighting, skin finish, color grade and (in panel 3) face idealization, at three very different levels that must be obvious at a glance: (1) an ID photo — the photo exactly as it is; (2) a clean commercial headshot — re-shot by a professional with makeup, styling and lighting, still clearly recognizable; (3) a premium K-beauty campaign shot — ${g[2]} re-imagined as a top beauty model in clean high-key light with bold idealization of the face, only a faint resemblance kept. Panel 1 is a copy of the input; panels 2 and 3 must NOT look like copies of the input. If the three panels look alike, the result is wrong. All three panels share the same seamless, flat, near-white light-gray backdrop and a plain black top; the backdrop never changes.${hair?' Base hairstyle for all panels: '+hair+'.':''}`;
  const p1=`Panel 1 (left), small label "KEEP" at the bottom — ID photo, the photo as it is: the face, skin texture, marks, expression and hair exactly as in the input photo, aligned straight-on to the camera, no beautification or retouching at all; soft, flat, even frontal light with almost no shadow; skin with its natural sheen; hair as it naturally falls; a plain black camisole top; neutral, true-to-life color. It should look like a passport photo of this person.`;
  const p2=`Panel 2 (center), label "NATURAL" — clean commercial headshot, re-shot by a professional: same eye shape, nose, lips, face type and skin tone so ${g[1]} is clearly recognizable, the same frontal pose with a composed camera-ready expression, clean natural makeup with light definition (even base, softly shaped brows, subtly defined lashes, a natural rosy lip tint), hair freshly styled with light volume, shine and a little airy texture, skin retouched to a luminous, even, dewy finish with a soft radiant glow on the cheekbones while fine pores stay visible, bright high-key soft frontal beauty light with minimal shadows and a soft catchlight, a fitted black crew-neck tee, a clean bright slightly cool color grade; the face gently refined — cleaner jawline, brighter eyes. Clearly more attractive and professional than panel 1.`;
  const p3=`Panel 3 (right), label "GLOW" — premium K-beauty campaign shot: ${g[1]} re-imagined as a top beauty model photographed for a premium cosmetics brand. Same frontal pose. Idealize the face boldly into an editorial supermodel version — sharper sculpted bone structure, perfected proportions and symmetry, larger luminous eyes, fuller defined lips, flawless skin — keeping only a faint resemblance (general face type, hair color). Clean editorial K-beauty makeup — softly defined eyes with subtle liner and lashes, groomed straight brows, delicate contour, a rosy pink lip tint — refined rather than dramatic; porcelain glass skin at its most perfect — flawless even tone with a wet-look luster and dewy highlights on the cheekbones, nose bridge and brow bone, yet with fine pores and natural skin grain clearly preserved, never plastic or airbrushed; hair restyled with airy volume, glossy texture and softly tousled movement at the ends; bright high-key frontal beauty light with minimal shadows and a clean catchlight, on the same near-white light-gray backdrop; a black crew-neck tee; a clean, bright, slightly cool color grade with neutral whites. Unmistakably a premium beauty-campaign model — dramatically more polished than panel 1, on the same light-gray backdrop.`;
  const tail=`Photorealistic throughout, each panel sharp with the face in precise focus, consistent framing scale across panels (head-and-shoulders). Wide landscape format, 3:1 overall (three 1:1 panels).${f.direction?' Additional direction for all panels ('+DIR_SCOPE+'): '+f.direction.trim():''}`;
  return [head,p1,p2,p3,tail].join('\n\n');
}

const PromptEngine={EN,LOOK,POSE_LOCK,STRENGTH_EN,humanPrompt,animalPrompt,animePrompt,comparePrompt};
root.PromptEngine=PromptEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=PromptEngine;
})(typeof window!=='undefined'?window:globalThis);
