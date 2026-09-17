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
const heightPhrase=h=>{h=parseInt(h,10);if(!h)return '';const band=h<=158?'petite':h<=166?'average-height':h<=176?'tall':'very tall';return `about ${h} cm tall (${band}), with realistic leg-to-torso proportions for that height`;};
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
  if(f.skin)refine.push(EN.skin[f.skin]); if(f.eye)refine.push(EN.eye[f.eye]); if(f.body)refine.push(EN.body[f.body]); if(f.height)refine.push(heightPhrase(f.height));

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

/* ── 스타일링(옷·악세서리) ───────────────────────────────
   f: { framing:'half'|'full', preset, top, topColor, bottom, bottomColor, outer, shoes, acc:[...], direction, gender }
   데뷔 이미지를 입력으로 하는 편집 지시문. 얼굴·헤어·정면 자세·라이트그레이 배경 고정, 의상·악세서리만 변경. */
const STYLE_EN={
  preset:{'캐주얼':'relaxed everyday casual styling','미니멀':'clean minimal styling in neutral tones','스트리트':'urban streetwear styling','오피스':'polished smart office styling','스포티':'athleisure sportswear styling','클래식':'timeless classic tailored styling','럭셔리':'understated luxury brand styling with premium fabrics','하이패션':'bold high-fashion editorial styling','로맨틱':'soft romantic feminine styling','빈티지':'vintage-inspired styling'},
  top:{'티셔츠':'a plain crew-neck t-shirt','오버핏 티셔츠':'an oversized boxy t-shirt','셔츠':'a crisp button-up shirt','오버핏 셔츠':'an oversized relaxed shirt','블라우스':'a soft blouse','니트':'a fine-knit sweater','후디':'a hoodie','크롭탑':'a fitted crop top','캐미솔':'a camisole top','터틀넥':'a slim turtleneck','폴로':'a polo shirt','탱크탑':'a ribbed tank top','스웻셔츠':'a sweatshirt','베스트':'a knit vest over a shirt','원피스':'a simple dress'},
  bottom:{'데님':'straight-leg jeans','와이드 데님':'wide-leg jeans','슬랙스':'tailored slacks','와이드 팬츠':'wide-leg trousers','카고':'cargo pants','조거':'jogger pants','쇼츠':'shorts','미니스커트':'a mini skirt','미디스커트':'a midi skirt','롱스커트':'a long skirt','레깅스':'leggings','치노':'chino pants'},
  outer:{'없음':'','블레이저':'a tailored blazer','가죽 재킷':'a leather jacket','트렌치코트':'a trench coat','데님 재킷':'a denim jacket','울 코트':'a long wool coat','카디건':'a cardigan','바람막이':'a light windbreaker','패딩':'a puffer jacket','봄버':'a bomber jacket','베스트':'a padded vest'},
  shoes:{'스니커즈':'clean white sneakers','로퍼':'leather loafers','첼시 부츠':'chelsea boots','앵클 부츠':'ankle boots','힐':'pointed heels','샌들':'strappy sandals','더비':'derby shoes','슬리퍼':'slide sandals','러닝화':'running shoes'},
  acc:{'실버 목걸이':'a slim silver chain necklace','골드 목걸이':'a delicate gold necklace','펄 목걸이':'a pearl necklace','작은 후프 이어링':'small hoop earrings','드롭 이어링':'drop earrings','안경':'thin metal-frame glasses','선글라스':'sunglasses','볼캡':'a baseball cap','비니':'a beanie','버킷햇':'a bucket hat','시계':'a minimal wristwatch','링':'a couple of thin rings','스카프':'a silk scarf','헤드폰':'over-ear headphones around the neck','토트백':'a leather tote bag','크로스백':'a small crossbody bag','벨트':'a slim leather belt','초커':'a black choker'},
  color:{'블랙':'black','화이트':'white','오프화이트':'off-white','그레이':'gray','차콜':'charcoal','네이비':'navy','베이지':'beige','카멜':'camel','브라운':'brown','올리브':'olive','카키':'khaki','레드':'red','버건디':'burgundy','블루':'blue','스카이블루':'sky blue','그린':'green','핑크':'pink','라벤더':'lavender','옐로':'yellow','크림':'cream','데님블루':'denim blue'},
};
const LOOK_PANELS=[['bust','상체','BUST','a square 1:1 head-and-shoulders headshot in beauty-lookbook style: a comfortable margin of empty backdrop above the head (about one tenth of the frame height), the bottom edge at the upper chest just below the shoulders, the face taking up roughly 40–45% of the frame height with the eyes a little above the center — the face, hair, neckline and collar of the top and any earrings or necklace clearly visible'],['knee','니샷','KNEE','a square 1:1 three-quarter lookbook crop from just above the top of the head down to the mid-thigh, just above the knees, the top, outer layer and the upper part of the bottoms all visible'],['full','풀샷','FULL','a full-body shot from the top of the head to the shoes with a little floor visible below the feet, the whole outfit including shoes visible']];
const FACE_DETAIL='Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.';
/* 얼굴 보정 패스: 상반신 결과의 얼굴 부분만 잘라 다시 편집 */
const FACE_FIX='Image 1 is a close crop of a person\'s face from a lookbook photo. Re-render this exact crop as a clean, high-fidelity beauty-campaign close-up of the SAME person: identical identity, facial features, expression, gaze, head angle, hair, makeup, earrings and clothing edges, identical framing and background. Change nothing about who they are or how they are posed — only restore clarity: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth hair strands, smooth tonal gradients, no noise, speckles, blotches or artificial texture. Photorealistic, square 1:1.';
const IDENTITY_BASE='Keep the model\'s identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. ';
/* 룩 포즈: body는 니샷·풀샷, head는 세 컷 공통(상체는 head만) */
const HEAD_FRONT='face toward the camera, head upright, eyes into the lens, camera at eye level';
const POSE_DEFAULT={body:'unspecified pose — a natural, relaxed standing pose of the stylist\'s choice',head:HEAD_FRONT};
/* 사용자 확정 포즈 목록(2026-09-13): 표시 이름 → 프롬프트용 영어. head가 없으면 정면 시선 */
const POSE_EN={
  '정면으로 자연스럽게 서기':{body:'standing naturally, facing forward'},
  '편하게 서기':{body:'relaxed standing pose'},
  '손을 앞에 모으고 서기':{body:'standing with hands lightly clasped in front'},
  '팔을 자연스럽게 내리고 서기':{body:'standing with arms relaxed at the sides'},
  '한 손을 허리에 두고 서기':{body:'standing with one hand on the hip'},
  '한 손을 스테이션에 올리기':{body:'standing with one hand lightly resting on the station'},
  '정면을 보며 대화하기':{body:'facing forward and speaking naturally',head:'face toward the camera as if speaking to the viewer, eyes into the lens'},
  '손짓하며 설명하기':{body:'speaking with a natural one-hand gesture'},
  '두 손을 펼쳐 설명하기':{body:'explaining with both hands slightly open'},
  '가볍게 인사하기':{body:'giving a small friendly wave'},
  '고개를 살짝 끄덕이기':{body:'slightly nodding while engaging with the viewer',head:'head in a slight nod, eyes toward the viewer'},
  '몸을 살짝 틀어 서기':{body:'standing at a slight three-quarter angle',head:'face turned toward the camera, eyes into the lens'},
  '걷다가 멈춰 바라보기':{body:'pausing mid-step and looking forward'}
};
const POSES=Object.keys(POSE_EN);
function poseText(f,frame){const p=POSE_EN[f&&f.pose]||POSE_DEFAULT;const head=p.head||HEAD_FRONT;return frame==='bust'?`Pose: ${p.body}, framed head-and-shoulders; ${head}.`:`Pose: ${p.body}; ${head}.`;}
const identity=(f,frame)=>IDENTITY_BASE+poseText(f,frame)+' Change ONLY the clothing and accessories.';
const IDENTITY=identity(null,'knee');
function outfitText(f){
  const g=EN.gender[f.gender]||['person','they','their'];
  if(f.mode==='garment'&&f.refs&&f.refs.length){const n=f.refs.length,base=f.refBase||2;const dir=(f.direction||'').trim();
    return `Images ${base} to ${base+n-1} are reference photos of garments and accessories (some may show the front and back of the same item). Every item shown in them MUST be worn by the model, reproduced exactly — the same color, fabric, pattern, print, cut, length, fit and details (buttons, seams, logos, hardware); use a front view for the visible front and a back view for construction and length. Do not substitute similar items or invent replacements for referenced pieces. For parts of the outfit NOT shown in the references: ${dir?`follow this direction — "${dir}"`:'a stylist\'s free choice'} — and where neither applies, choose simple, clean, neutral pieces that complement the referenced items. Fabrics and fit rendered realistically with natural folds and drape, worn naturally on ${g[2]} body.`;}
  const col=k=>STYLE_EN.color[k]||'';
  const topRaw=STYLE_EN.top[f.top];const top=topRaw?(col(f.topColor)?aOrAn(col(f.topColor)+' '+topRaw.replace(/^an? /,'')):topRaw):'';
  const botRaw=STYLE_EN.bottom[f.bottom];const bottom=botRaw?(col(f.bottomColor)?col(f.bottomColor)+' '+botRaw.replace(/^an? /,''):botRaw):'';
  const outer=STYLE_EN.outer[f.outer]||'';const shoes=STYLE_EN.shoes[f.shoes]||'';
  const accs=(f.acc||[]).map(a=>STYLE_EN.acc[a]).filter(Boolean);const preset=STYLE_EN.preset[f.preset]||'';
  const outfit=[top||'a simple, well-fitted top',outer?`layered with ${outer}`:'',bottom||'well-fitted bottoms',shoes||'clean minimal shoes'].filter(Boolean).join(', ');
  return `Outfit: ${preset?preset+' — ':''}${cap(g[1])} wears ${outfit}. ${accs.length?`Accessories: ${accs.join(', ')}.`:'No added accessories.'} Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.`;
}
const LOOK_SKIN='luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign';
const SCENE=()=>`Background: ${LOOK.backdrop}. Lighting: ${LOOK.keyLight}. Skin: ${LOOK_SKIN}. Color: ${LOOK.grade}.`;
/* 상체 · 니샷 · 풀샷을 각각 별도 이미지로 — 얼굴 픽셀을 확보해 디테일을 살린다 */
function lookPrompts(f){
  const dirLine=(f.mode==='garment')?'':directionLine(f.direction,'mood, styling details and props only — it must not change the face, hair, pose or the light-gray backdrop');
  const hp=f.height?` Body proportions of a person ${heightPhrase(f.height)} — keep the head-to-body ratio realistic and do not exaggerate leg length.`:'';
  const one=(desc,fmt,refBust,extra,frame)=>{
    const head=refBust?`Image 1 is the model. Image 2 is a lookbook photo of the same model in the target outfit. Edit into ${desc}, the model centered. Wear EXACTLY the same outfit and accessories as in Image 2 — identical garments, colors, fit and styling; only the framing changes. `:`Image 1 is the model. Edit Image 1 into ${desc}, the model centered. `;
    return [S_(head+identity(f,frame)+(extra||'')), S_(outfitText(Object.assign({},f,{refBase:refBust?3:2}))), S_(SCENE()+' '+FACE_DETAIL), S_(dirLine)+`Photorealistic, premium brand lookbook quality. ${fmt}`].map(x=>x.trim()).filter(Boolean).join('\n\n');};
  const P=LOOK_PANELS;
  const bust=one(P[0][3],'Square 1:1 format, 1024×1024.',false,'','bust');
  const knee=one(P[1][3],'Square 1:1 format, 1024×1024.',!!f.bustRef,hp,'knee');
  const full=one(P[2][3]+', the full figure filling the frame from top to bottom without cropping the head or feet','Tall portrait format, 1024×1536.',!!f.bustRef,hp,'full');
  // ChatGPT용: 한 메시지에 3장을 요구하면 이미지 도구가 1회만 돌아 같은 크롭의 변주만 나온다.
  // 그래서 3개의 연속 메시지로 만든다. 각 메시지는 첫 문장에서 "이미지 1장, 이 캔버스 비율"을 못 박고, 2·3단계는 직전 결과의 의상을 그대로 입힌다.
  const shared=S_(SCENE()+' '+FACE_DETAIL)+' '+S_(dirLine)+'Photorealistic, premium brand lookbook quality.';
  // 포즈는 세 장에서 동일해야 함 — shared 뒤에 명시

  const step1=[S_('Generate exactly ONE image, SQUARE format 1:1 (1024×1024). Image 1 is the model. Edit Image 1 into '+P[0][3]+'. The bottom edge of the frame cuts at the upper chest just below the shoulders: no arms below the shoulder, no waist or hands visible, the face large and detailed in frame. '+identity(f,'bust')),
    S_(outfitText(Object.assign({},f,{refBase:2}))), shared].map(x=>x.trim()).filter(Boolean).join('\n\n');
  const step2=[S_('Now generate exactly ONE new image, SQUARE format 1:1 (1024×1024), with a DIFFERENT, wider crop — this must NOT be a variation of the previous image. Same model as Image 1, wearing EXACTLY the outfit and accessories from the image you just generated (identical garments, colors, fit and styling). Framing: '+P[1][3]+'. The bottom edge of the frame cuts at the mid-thigh, just above the knees: the thighs visible, no knees, shins or feet. The figure is noticeably smaller than before, with clear empty space above the head. '+identity(f,'knee')+hp), shared].map(x=>x.trim()).filter(Boolean).join('\n\n');
  const step3=[S_('Now generate exactly ONE new image in TALL PORTRAIT format 2:3 (1024×1536, vertical) — this must NOT be a variation of the previous images. Same model as Image 1, wearing EXACTLY the outfit and accessories from the images you just generated. Framing: '+P[2][3]+': head to toe in frame, shoes and the floor visible, a little space above the head and below the feet, nothing cropped. The figure is small in the tall frame. '+identity(f,'full')+hp), shared].map(x=>x.trim()).filter(Boolean).join('\n\n');
  const chatSteps=[step1,step2,step3];
  const combined=chatSteps.map((t,i)=>`━━━━━━ ${i+1}단계 · ChatGPT에 ${i===0?'모델 이미지(와 의상 참조)를 첨부해':'이어서'} 보내기 ━━━━━━\n\n${t}`).join('\n\n\n');
  return {bust,knee,full,combined,chatSteps};
}
/* 구버전 호환: 단일 시트 프롬프트는 상반신 프롬프트를 돌려준다 */
function stylePrompt(f){return lookPrompts(f).bust;}

/* ===== 배경(Background) 단계 ===== */
const BG_EN={
  scene:{
    '화이트 스튜디오':'a clean seamless white photo studio with a soft gradient floor',
    '컬러 스튜디오':'a seamless single-color photo studio backdrop with a matching floor',
    '미니멀 인테리어':'a bright minimal interior with plaster walls, a light wooden floor and soft window light',
    '카페':'a modern cafe interior with warm wood, large windows and soft daylight',
    '도심 거리':'a clean modern city street with glass storefronts and a wide sidewalk',
    '매장 / 쇼핑몰':'a bright premium retail store interior with display shelves and a polished floor',
    '오피스 로비':'a modern office lobby with glass, light stone and soft ambient light',
    '공원 / 자연':'a green urban park with trees, a paved path and dappled sunlight',
    '해변':'a calm sandy beach with soft waves and a pale sky',
    '네온 야경':'a city street at night with soft neon signs and bokeh lights',
    '럭셔리 호텔':'an elegant hotel lobby with marble floors, warm lamps and tall ceilings',
    '갤러리':'a white-cube art gallery with a concrete floor and a skylight',
    '강변 / 스카이라인':'a riverside promenade with a city skyline in the distance'
  },
  light:{'자연광 (낮)':'bright natural daylight','골든아워':'warm golden-hour sunlight with long soft shadows','흐린 날':'soft overcast diffused light','실내 소프트':'soft indoor ambient light','야간':'night with ambient artificial light','스튜디오 조명':'controlled, even studio lighting'},
  aspect:{'1:1':'1024x1024','2:3 세로':'1024x1536','3:2 가로':'1536x1024'},
  depth:{'얕은 심도':'shallow depth of field — the background planes softly out of focus, the standing area in front crisp','보통 심도':'moderate depth of field with the mid-ground gently soft','깊은 심도':'deep focus — the whole space crisp and legible'},
  camera:{'아이레벨 35mm':'camera at eye level, 35mm-equivalent perspective','로우앵글 24mm':'camera slightly below eye level, wide 24mm-equivalent perspective that stretches the floor toward the viewer','압축 85mm':'camera at chest height, 85mm-equivalent telephoto that compresses the space'}
};
/* 배경 플레이트 프롬프트: 사람 없이, 가운데 앞쪽에 모델이 설 자리를 비워 둔다 */
function bgPrompt(o){
  o=o||{};const n=(o.refs||0);const sceneRaw=BG_EN.scene[o.scene]||'';const col=STYLE_EN.color[o.color]||'';
  const scene=o.scene==='컬러 스튜디오'&&col?sceneRaw.replace('single-color',col):sceneRaw;
  const light=BG_EN.light[o.light]||'';const dir=(o.direction||'').trim();const depth=BG_EN.depth[o.depth]||'';const cam=BG_EN.camera[o.camera]||'camera at eye level, moderate 35mm-equivalent perspective';
  const refLine=n?`Images 1 to ${n} are reference photos of the location and mood. Recreate the same kind of space, materials, colors and atmosphere as a new, clean plate — do not copy them pixel for pixel. `:'';
  const twist=(o.twist||'').trim();
  const what=scene?`Create an empty background plate: ${scene}${twist?`, with ${twist}`:''}.`:(n?'Create an empty background plate of this kind of place.':'Create an empty, clean background plate suitable for a fashion lookbook.');
  const asp={'1:1':'Square 1:1 format, 1024×1024.','2:3 세로':'Tall portrait format 2:3, 1024×1536.','3:2 가로':'Landscape format 3:2, 1536×1024.'}[o.aspect]||'Tall portrait format 2:3, 1024×1536.';
  return [S_(refLine+what+(dir?` Direction: "${dir}".`:'')),
    S_('This plate will later have a fashion model composited into it, so it must contain NO people, mannequins, text, logos or signage. Leave a clear, unobstructed standing area in the center foreground with the floor visible at the bottom of the frame and nothing important at the center. '+cap(cam)+', the main planes of the scene roughly 3 to 5 meters from the camera'+(depth?'. '+cap(depth):'')),
    S_((light?`Lighting: ${light}. `:'')+'Photorealistic, clean, premium campaign look with realistic materials and smooth tonal gradients. '+asp)].map(x=>x.trim()).filter(Boolean).join('\n\n');
}
/* 합성 출력 비율: en=프롬프트 문구, api=가장 가까운 API 캔버스, r=최종 가로/세로 비(후처리 센터 크롭) */
const OUT_RATIO={
  '1:1':{en:'square 1:1',api:'1024x1024',r:1},
  '3:4 세로':{en:'portrait 3:4',api:'1024x1536',r:3/4},
  '2:3 세로':{en:'tall portrait 2:3',api:'1024x1536',r:2/3},
  '9:16 세로':{en:'vertical 9:16 (mobile / kiosk screen)',api:'1024x1536',r:9/16},
  '4:3 가로':{en:'landscape 4:3',api:'1536x1024',r:4/3},
  '3:2 가로':{en:'landscape 3:2',api:'1536x1024',r:3/2},
  '16:9 가로':{en:'widescreen 16:9',api:'1536x1024',r:16/9}
};
/* 룩 + 배경 합성 프롬프트: 모델·의상·포즈는 그대로, 라이트그레이 배경만 장면으로 교체 */
function scenePrompt(o){
  o=o||{};const frame=o.frame||'full';const dir=(o.direction||'').trim();
  const R=OUT_RATIO[o.ratio]||null;
  const fmt=R?`Output format: ${R.en}. Extend the scene to fill the new canvas — never crop the model; keep the model at the same size and position relative to the frame center and let the environment continue naturally into the added area.`:({bust:'Square 1:1 format, 1024×1024.',knee:'Square 1:1 format, 1024×1024.',full:'Tall portrait format 2:3, 1024×1536.'}[frame]||'Same canvas as Image 1.');
  const bgLine=o.hasBg?'Image 2 is the background scene.':`There is no background image; use this scene: ${o.bgText||'a clean, bright, premium location'}.`;
  const ground=frame==='full'?'the feet planted on the visible floor with a natural soft contact shadow and correct scale':'natural soft ambient shadowing consistent with the scene';
  return [S_(`Image 1 is a lookbook photo of a model on a flat light-gray studio backdrop. ${bgLine} Composite the model into that scene.`),
    S_('Keep the model 100% identical to Image 1 — face, hair, expression, gaze, pose, body, and every garment and accessory exactly as they are'+(R?', at the same scale, only the canvas around the model changes':', with the SAME framing, crop and canvas as Image 1')+'. Do not restyle, redraw or move the model'),
    S_(`Replace ONLY the gray backdrop with the environment${o.hasBg?' of Image 2':''}, seen from the same eye-level camera. Integrate the model naturally: apply the scene\'s lighting direction, color temperature and contrast to the model, ${ground}, and a slight depth of field on the background so the model remains the sharpest element`),
    S_((dir?`Direction: "${dir}". `:'')+'No text, no extra people. Photorealistic, premium campaign quality. '+fmt)].map(x=>x.trim()).filter(Boolean).join('\n\n');
}


/* 룩에 어울리는 배경 추천: 스펙 키워드 → 장면 점수 → 상위 4개 */
const BG_RULES=[
  [/트렌치|코트|블레이저|재킷|자켓|슬랙스|셔츠|로퍼|테일러/, ['오피스 로비','도심 거리','럭셔리 호텔','갤러리']],
  [/니트|스웨터|카디건|플리스|울/, ['카페','미니멀 인테리어','공원 / 자연','강변 / 스카이라인']],
  [/데님|청|티셔츠|후드|스니커즈|트레이닝|캡/, ['도심 거리','네온 야경','공원 / 자연','매장 / 쇼핑몰']],
  [/드레스|원피스|스커트|힐|실크|새틴/, ['럭셔리 호텔','갤러리','강변 / 스카이라인','화이트 스튜디오']],
  [/레더|가죽|블랙|차콜/, ['네온 야경','갤러리','도심 거리','컬러 스튜디오']],
  [/린넨|여름|반팔|샌들|화이트|크림|오프화이트/, ['해변','공원 / 자연','카페','화이트 스튜디오']],
  [/베이지|카멜|브라운|카키|올리브/, ['카페','미니멀 인테리어','공원 / 자연','럭셔리 호텔']],
  [/스포티|애슬레저|러닝/, ['공원 / 자연','도심 거리','강변 / 스카이라인','매장 / 쇼핑몰']],
  [/미니멀|클린|베이직/, ['화이트 스튜디오','미니멀 인테리어','갤러리','컬러 스튜디오']],
  [/스트릿|힙|오버사이즈/, ['도심 거리','네온 야경','매장 / 쇼핑몰','강변 / 스카이라인']]
];
const BG_DEFAULT_RECO=['화이트 스튜디오','미니멀 인테리어','도심 거리','카페'];
function recommendScenes(text){const score={};BG_RULES.forEach(([re,list])=>{if(re.test(text||''))list.forEach((k,i)=>{score[k]=(score[k]||0)+(4-i);});});
  const ranked=Object.keys(score).sort((a,b)=>score[b]-score[a]);const out=ranked.slice(0,4);BG_DEFAULT_RECO.forEach(k=>{if(out.length<4&&!out.includes(k))out.push(k);});return out;}
/* ChatGPT용 자유 탐색 프롬프트: 개수·카테고리를 정하지 않고, 룩을 보고 서로 다른 배경 플레이트를 자유롭게 제안·생성하게 한다 */
function bgFreePrompt(o){o=o||{};
  const asp={'1:1':'square 1:1 (1024×1024)','2:3 세로':'tall portrait 2:3 (1024×1536)','3:2 가로':'landscape 3:2 (1536×1024)'}[o.aspect]||(o.frame==='full'?'tall portrait 2:3 (1024×1536)':'square 1:1 (1024×1024)');
  const hint=o.spec?` Outfit notes: ${o.spec}.`:'';const dir=(o.direction||'').trim();const n=o.count?`${o.count} `:'several ';
  return [S_(`Image 1 is a lookbook photo of a fashion model on a flat light-gray studio backdrop.${hint} You are the creative director for this brand campaign. Read the outfit — colors, fabrics, formality, season, attitude — and imagine where this look would truly come alive. Propose ${n}background locations you find genuinely compelling for it${dir?`, following this direction: "${dir}"`:''}. Surprise me: think beyond the obvious cafe / street / park, mix scales (intimate corner vs vast space), eras, materials and moods.`),
    S_('Every proposal must be unmistakably different from the others — change the type of place, the time of day and light quality, the color palette, the depth of field, the camera height and lens feel, and the mood. If two ideas feel alike, replace one. Write one line per idea (name + why it suits the outfit) before generating'),
    S_('Then generate each idea as its own image, one image per call, never a collage or grid. These are EMPTY background plates: no people, mannequins, text, logos or signage; a clear, unobstructed standing area in the center foreground with the floor visible at the bottom of the frame; realistic materials and premium campaign quality; lighting a model lit softly from the front could sit in. Format for all: '+asp)].join('\n\n');}
/* 랜덤 무드: 풀에서 뽑아 옵션을 채운다 (단일 배경 프롬프트의 자유도 확대) */
const BG_TWIST=['a wet floor with soft reflections','a single colored gel light spilling from one side','thin haze catching the light','a large mirror on one wall','abundant potted plants','strong window blinds shadow pattern','a vintage patterned floor','rain streaks on the glass behind','warm tungsten practicals against cool daylight','a bold painted accent wall','long late-day shadows across the floor','a curtain of sheer fabric moving in a breeze','a wide empty concrete expanse','brass and dark wood details','pastel gradient light on a plain wall','a curved architectural arch framing the standing area'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function randomBrief(){return {scene:pick(Object.keys(BG_EN.scene)),light:pick(Object.keys(BG_EN.light)),depth:pick(Object.keys(BG_EN.depth)),camera:pick(Object.keys(BG_EN.camera)),twist:pick(BG_TWIST)};}

const PromptEngine={STYLE_EN,LOOK_PANELS,BG_EN,OUT_RATIO,BG_TWIST,bgPrompt,scenePrompt,recommendScenes,bgFreePrompt,randomBrief,POSES,POSE_EN,poseText,FACE_DETAIL,FACE_FIX,heightPhrase,stylePrompt,lookPrompts,EN,LOOK,POSE_LOCK,STRENGTH_EN,humanPrompt,animalPrompt,animePrompt,comparePrompt};
root.PromptEngine=PromptEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=PromptEngine;
})(typeof window!=='undefined'?window:globalThis);
