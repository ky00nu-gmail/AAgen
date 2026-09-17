# A. 내 얼굴 모델 — 3단계 비교 (그대로 · 약하게 · 글로우, 한 장 3패널)

입력: 얼굴 사진 1장(Image 1). 출력: 가로로 3패널이 붙은 1장. 사용자는 패널 번호(1 KEEP · 2 NATURAL · 3 GLOW)를 골라 그 패널만 잘라 쓴다.

**옵션(모두 선택)**: 성별, 신장, 헤어 스타일(여성/남성 목록 다름), 헤어 컬러, 눈 색, 피부톤, 메이크업, 타투, 디렉션. 인종·나이대는 사진 원본을 유지하므로 받지 않는다.

### 템플릿 (옵션 없음 = 기준선)

```text
Edit the attached photo into ONE single wide image split into three equal vertical panels, side by side, separated by thin white gutters. All three panels show the same real woman from the input image in the SAME straight-on frontal ID-photo pose — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, identical head-and-shoulders framing in every panel. Even if the input photo is angled or tilted, every panel is rotated to this frontal pose while keeping the facial features faithful. What changes between panels is only styling, lighting, skin finish, color grade and (in panel 3) face idealization, at three very different levels that must be obvious at a glance: (1) an ID photo — the photo exactly as it is; (2) a clean commercial headshot — re-shot by a professional with makeup, styling and lighting, still clearly recognizable; (3) a premium K-beauty campaign shot — her re-imagined as a top beauty model in clean high-key light with bold idealization of the face, only a faint resemblance kept. Panel 1 is a copy of the input; panels 2 and 3 must NOT look like copies of the input. If the three panels look alike, the result is wrong. All three panels share the same seamless, flat, near-white light-gray backdrop and a plain black top; the backdrop never changes.

Panel 1 (left), small label "KEEP" at the bottom — ID photo, the photo as it is: the face, skin texture, marks, expression and hair exactly as in the input photo, aligned straight-on to the camera, no beautification or retouching at all; soft, flat, even frontal light with almost no shadow; skin with its natural sheen; hair as it naturally falls; a plain black camisole top; neutral, true-to-life color. It should look like a passport photo of this person.

Panel 2 (center), label "NATURAL" — clean commercial headshot, re-shot by a professional: same eye shape, nose, lips, face type and skin tone so she is clearly recognizable, the same frontal pose with a composed camera-ready expression, clean natural makeup with light definition (even base, softly shaped brows, subtly defined lashes, a natural rosy lip tint), hair freshly styled with light volume, shine and a little airy texture, skin retouched to a luminous, even, dewy finish with a soft radiant glow on the cheekbones while fine pores stay visible, bright high-key soft frontal beauty light with minimal shadows and a soft catchlight, a fitted black crew-neck tee, a clean bright slightly cool color grade; the face gently refined — cleaner jawline, brighter eyes. Clearly more attractive and professional than panel 1.

Panel 3 (right), label "GLOW" — premium K-beauty campaign shot: she re-imagined as a top beauty model photographed for a premium cosmetics brand. Same frontal pose. Idealize the face boldly into an editorial supermodel version — sharper sculpted bone structure, perfected proportions and symmetry, larger luminous eyes, fuller defined lips, flawless skin — keeping only a faint resemblance (general face type, hair color). Clean editorial K-beauty makeup — softly defined eyes with subtle liner and lashes, groomed straight brows, delicate contour, a rosy pink lip tint — refined rather than dramatic; porcelain glass skin at its most perfect — flawless even tone with a wet-look luster and dewy highlights on the cheekbones, nose bridge and brow bone, yet with fine pores and natural skin grain clearly preserved, never plastic or airbrushed; hair restyled with airy volume, glossy texture and softly tousled movement at the ends; bright high-key frontal beauty light with minimal shadows and a clean catchlight, on the same near-white light-gray backdrop; a black crew-neck tee; a clean, bright, slightly cool color grade with neutral whites. Unmistakably a premium beauty-campaign model — dramatically more polished than panel 1, on the same light-gray backdrop.

Photorealistic throughout, each panel sharp with the face in precise focus, consistent framing scale across panels (head-and-shoulders). Wide landscape format, 3:1 overall (three 1:1 panels).
```

### 예시 — 남성 · 178cm · 댄디컷 · 다크 브라운 · 디렉션 "살짝 미소"

```text
Edit the attached photo into ONE single wide image split into three equal vertical panels, side by side, separated by thin white gutters. All three panels show the same real man from the input image in the SAME straight-on frontal ID-photo pose — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, identical head-and-shoulders framing in every panel. Even if the input photo is angled or tilted, every panel is rotated to this frontal pose while keeping the facial features faithful. What changes between panels is only styling, lighting, skin finish, color grade and (in panel 3) face idealization, at three very different levels that must be obvious at a glance: (1) an ID photo — the photo exactly as it is; (2) a clean commercial headshot — re-shot by a professional with makeup, styling and lighting, still clearly recognizable; (3) a premium K-beauty campaign shot — his re-imagined as a top beauty model in clean high-key light with bold idealization of the face, only a faint resemblance kept. Panel 1 is a copy of the input; panels 2 and 3 must NOT look like copies of the input. If the three panels look alike, the result is wrong. All three panels share the same seamless, flat, near-white light-gray backdrop and a plain black top; the backdrop never changes. Base hairstyle for all panels: dark brown neat Korean dandy cut.

Panel 1 (left), small label "KEEP" at the bottom — ID photo, the photo as it is: the face, skin texture, marks, expression and hair exactly as in the input photo, aligned straight-on to the camera, no beautification or retouching at all; soft, flat, even frontal light with almost no shadow; skin with its natural sheen; hair as it naturally falls; a plain black camisole top; neutral, true-to-life color. It should look like a passport photo of this person.

Panel 2 (center), label "NATURAL" — clean commercial headshot, re-shot by a professional: same eye shape, nose, lips, face type and skin tone so he is clearly recognizable, the same frontal pose with a composed camera-ready expression, clean natural makeup with light definition (even base, softly shaped brows, subtly defined lashes, a natural rosy lip tint), hair freshly styled with light volume, shine and a little airy texture, skin retouched to a luminous, even, dewy finish with a soft radiant glow on the cheekbones while fine pores stay visible, bright high-key soft frontal beauty light with minimal shadows and a soft catchlight, a fitted black crew-neck tee, a clean bright slightly cool color grade; the face gently refined — cleaner jawline, brighter eyes. Clearly more attractive and professional than panel 1.

Panel 3 (right), label "GLOW" — premium K-beauty campaign shot: he re-imagined as a top beauty model photographed for a premium cosmetics brand. Same frontal pose. Idealize the face boldly into an editorial supermodel version — sharper sculpted bone structure, perfected proportions and symmetry, larger luminous eyes, fuller defined lips, flawless skin — keeping only a faint resemblance (general face type, hair color). Clean editorial K-beauty makeup — softly defined eyes with subtle liner and lashes, groomed straight brows, delicate contour, a rosy pink lip tint — refined rather than dramatic; porcelain glass skin at its most perfect — flawless even tone with a wet-look luster and dewy highlights on the cheekbones, nose bridge and brow bone, yet with fine pores and natural skin grain clearly preserved, never plastic or airbrushed; hair restyled with airy volume, glossy texture and softly tousled movement at the ends; bright high-key frontal beauty light with minimal shadows and a clean catchlight, on the same near-white light-gray backdrop; a black crew-neck tee; a clean, bright, slightly cool color grade with neutral whites. Unmistakably a premium beauty-campaign model — dramatically more polished than panel 1, on the same light-gray backdrop.

Photorealistic throughout, each panel sharp with the face in precise focus, consistent framing scale across panels (head-and-shoulders). Wide landscape format, 3:1 overall (three 1:1 panels). Additional direction for all panels (applies to mood, expression nuance, styling and props only — it must not change the pose or the light-gray backdrop): 살짝 미소
```

### 단일 단계 프롬프트 (패널 대신 한 단계만 필요할 때)

**그대로 (keep)**

```text
Edit the attached photo into an ID-photo-style studio portrait of the same real person. Keep their identity 100% identical to the input image — the exact same face shape, eyes, eyebrows, nose, lips, teeth, skin texture, moles and marks, hairline and apparent age. Do not beautify, slim, retouch, smooth, symmetrize or idealize the face. Pose: a straight-on frontal ID-photo pose regardless of the angle in the input — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, head-and-shoulders framing centered. If the input photo is taken from an angle or the head is tilted, rotate the person to this frontal pose while keeping every facial feature and proportion faithful to them. Keep a similar neutral expression. This is the photo as it is, aligned to a frontal ID-photo pose, with only the selected styling options applied. Look reference: soft, flat, even studio light with almost no shadow; the skin exactly as in the photo with its natural sheen and texture; no makeup added; hair as it naturally falls in the photo; a plain black camisole top; neutral, true-to-life color.

Make only these changes: (1) background: a seamless, flat, near-white light-gray studio backdrop; (2) clothing: a plain black camisole top; (3) lighting: soft, flat, even studio light, cleaned up to natural exposure; (4) framing: head-and-shoulders at eye level, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens. The result must look like a passport photo of this exact person taken straight-on, restyled only where requested — not a lookalike and not a more attractive version.

Photorealistic result with natural-looking skin, an even healthy tone and a soft matte finish; clean, high-fidelity, the face in precise focus. Vertical portrait framing, 3:4 aspect ratio, same output size as the input.
```

**약하게 (light)**

```text
Re-shoot the person in the attached photo as a clean commercial headshot, as if a professional photographer, makeup artist and hair stylist worked on them for a brand lookbook. They must stay recognizable — same eye shape, nose, lips, face type, skin tone and apparent age. Pose: a straight-on frontal ID-photo pose regardless of the angle in the input — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, head-and-shoulders framing centered. If the input photo is taken from an angle or the head is tilted, rotate the person to this frontal pose while keeping every facial feature and proportion faithful to them. Within that fixed pose, this is a NEW photo, not a copy of the input: change the lighting, hair styling, makeup, skin finish and expression nuance freely. Look reference: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes — noticeably brighter and cleaner than the input; skin retouched to a luminous, even, dewy finish with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, while fine pores and natural skin grain stay visible; clean natural makeup with light definition (even luminous base, softly shaped brows, subtly defined lashes, a natural rosy lip tint); hair freshly styled with light volume, shine and a little airy texture; a fitted black crew-neck tee or camisole; a clean, bright, slightly cool color grade. The face may be gently refined — a slightly cleaner jawline, brighter and more open eyes.

Set the scene as follows and change everything else freely: (1) background: a seamless, flat, near-white light-gray studio backdrop; (2) clothing: a fitted black crew-neck tee or camisole; (3) lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes; (4) framing: head-and-shoulders, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens. The result should look clearly more attractive and professional than the original — a model headshot — while a friend would still say "that's them".

Photorealistic, clean commercial headshot quality: luminous, evenly retouched skin with real texture, clean bright tones, the face in precise focus. Vertical portrait framing, 3:4 aspect ratio, same output size as the input.
```

**글로우 (glow)**

```text
Re-imagine the person in the attached photo as a top K-beauty fashion model in a clean high-key studio beauty shot, as photographed for a premium cosmetics or fashion brand. Pose: a straight-on frontal ID-photo pose regardless of the angle in the input — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, head-and-shoulders framing centered. If the input photo is taken from an angle or the head is tilted, rotate the person to this frontal pose while keeping every facial feature and proportion faithful to them. Everything except the pose may be transformed boldly: idealize the face substantially into an editorial model version — sharper, more sculpted bone structure, perfected proportions and symmetry, larger luminous eyes, fuller defined lips, flawless skin. Only a faint resemblance to the input needs to remain (the general face type and hair color). This must look like a completely different, far more polished photograph, not an edit of the input. Look reference: bright high-key frontal beauty light with minimal shadows and a clean catchlight in the eyes, on a near-white light-gray backdrop; porcelain glass skin at its most perfect — flawless, perfectly even tone with a wet-look luster and dewy highlights along the cheekbones, nose bridge, brow bone and cupid's bow — yet with fine pores, natural skin grain and subtle micro-texture clearly preserved so it reads as real skin under a macro lens, never plastic, waxy or airbrushed; clean editorial K-beauty makeup — softly defined eyes with subtle liner and lashes, groomed straight brows, delicate contour, a rosy pink lip tint — refined rather than dramatic; hair restyled with airy volume, glossy texture and softly tousled movement at the ends, possibly a different parting or shape; a black crew-neck tee; a clean, bright, slightly cool color grade with neutral whites, the skin glowing against the light-gray backdrop.

Set the scene as follows and change everything else freely: (1) background: a seamless, flat, near-white light-gray studio backdrop; (2) clothing: a plain black crew-neck tee; (3) lighting: bright high-key frontal beauty light with minimal shadows and a clean catchlight; (4) framing: head-and-shoulders, straight-on frontal ID-photo pose, face and shoulders square to camera, eyes to lens. The result must be dramatically more polished than the original — unmistakably a premium beauty-campaign model — with only a faint echo of the original person, and the pose exactly as in the input.

Photorealistic, premium beauty-campaign quality: porcelain-luminous, flawless skin with fine pores and natural grain still visible, clean bright tones, the eyes in precise focus, a polished premium finish. Vertical portrait framing, 3:4 aspect ratio, same output size as the input.
```

### 옵션 사전 — 얼굴 단계

**성별**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 여성 | woman |
| 남성 | man |

**헤어 스타일 · 여성**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 긴 생머리 | long straight hair |
| 긴 레이어드 | long layered hair |
| 긴 웨이브 | long wavy hair |
| 미디엄 생머리 | medium-length straight hair |
| 롱보브 | a long bob |
| 단발 | a bob cut |
| 짧은 단발 | a short bob |
| 픽시컷 | a pixie cut |
| 커튼뱅 | curtain bangs framing the face |
| 옆가르마 | a side part |
| 가운데 가르마 | a center part |
| 포니테일 | a ponytail |
| 로우번 | a low bun |
| 내추럴 업두 | a loose natural updo |
| 웻룩 | slicked wet-look hair |
| 부드러운 컬 | soft curls |
| 타이트 컬 | tight curls |
| 땋은 머리 | braided hair |
| 슬릭백 | hair slicked straight back |
| 울프컷 | a shaggy wolf cut |

**헤어 스타일 · 남성**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 지정 안 함 |  |
| 자연스러운 숏컷 | natural short haircut |
| 댄디컷 | neat Korean dandy cut |
| 쉐도우펌 | soft Korean shadow perm |
| 가르마펌 | Korean side-part perm |
| 5:5 센터파트 | center-parted Korean hairstyle |
| 리프컷 | Korean leaf cut with softly parted fringe |
| 시스루뱅 | wispy see-through bangs |
| 투블럭 | Korean two-block haircut |
| 아이비리그컷 | Korean-style Ivy League haircut |
| 크롭컷 | textured crop haircut |
| 페이드컷 | clean fade haircut with textured top |
| 콤마헤어 | Korean comma hairstyle |
| 포마드 / 슬릭백 | slicked-back pompadour hairstyle |
| 웨이브펌 | soft wavy Korean perm |
| 히피펌 | messy Korean hippie perm |
| 울프컷(남) | Korean layered wolf cut |
| 장발 | medium-to-long layered men's hair |
| 헝클어진 머리 | messy tousled hair with natural volume |

**헤어 컬러**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 블랙 | black |
| 다크 브라운 | dark brown |
| 라이트 브라운 | light brown |
| 허니 브라운 | honey brown |
| 체스트넛 | chestnut |
| 블론드 | blonde |
| 애쉬 블론드 | ash blonde |
| 플래티넘 | platinum blonde |
| 스트로베리 | strawberry blonde |
| 레드 | red |
| 어번 | auburn |
| 코퍼 | copper |
| 애쉬 그레이 | ash gray |
| 실버 | silver |
| 옴브레 | ombré |
| 발레아쥬 | balayage |
| 핑크 | pastel pink |
| 라벤더 | lavender |
| 블루블랙 | blue-black |
| 민트 | mint |
| 스카이블루 | sky blue |
| 퍼플 | purple |
| 화이트 | white |

**눈 색**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 다크 브라운 | dark brown eyes |
| 라이트 브라운 | light brown eyes |
| 헤이즐 | hazel eyes |
| 그린 | green eyes |
| 블루 | blue eyes |
| 그레이 | gray eyes |
| 오드아이 | heterochromia, each eye a different color |
| 브라운 | brown eyes |
| 레드 | red eyes |
| 골드 | golden eyes |
| 퍼플 | purple eyes |
| 핑크 | pink eyes |
| 민트 | mint-green eyes |
| 앰버 | amber eyes |

**피부톤**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 도자기빛 | porcelain skin |
| 밝은 톤 | light skin |
| 올리브 | olive skin |
| 탠 | tan skin |
| 카라멜 | caramel skin |
| 딥 | deep, richly toned skin |

**메이크업**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 없음 | no makeup |
| 내추럴 | natural, barely-there makeup |
| 에디토리얼 | editorial makeup with a defined eye |
| 글래머 | full glam makeup |

**타투 위치**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 쇄골 | a small fine-line tattoo on the collarbone |
| 목 옆 | a small tattoo on the side of the neck |
| 귀 뒤 | a tiny tattoo behind the ear |
| 어깨 | a tattoo on the shoulder |
| 가슴 | a tattoo across the upper chest |
| 등 위쪽 | a tattoo on the upper back |
| 팔뚝 | a tattoo on the forearm |

**체형**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 슬림 | a slim build |
| 애슬레틱 | an athletic build |
| 근육질 | a muscular build |
| 볼륨감 | a curvy, full-figured build |
| 아담한 | a petite frame |

**신장** → `about 160 cm tall (average-height), with realistic leg-to-torso proportions for that height` 형태. 값별 문구:

| cm | 문구 |
|---|---|
| 150 | about 150 cm tall (petite), with realistic leg-to-torso proportions for that height |
| 155 | about 155 cm tall (petite), with realistic leg-to-torso proportions for that height |
| 160 | about 160 cm tall (average-height), with realistic leg-to-torso proportions for that height |
| 165 | about 165 cm tall (average-height), with realistic leg-to-torso proportions for that height |
| 170 | about 170 cm tall (tall), with realistic leg-to-torso proportions for that height |
| 175 | about 175 cm tall (tall), with realistic leg-to-torso proportions for that height |
| 180 | about 180 cm tall (very tall), with realistic leg-to-torso proportions for that height |
| 185 | about 185 cm tall (very tall), with realistic leg-to-torso proportions for that height |
| 190 | about 190 cm tall (very tall), with realistic leg-to-torso proportions for that height |
| 195 | about 195 cm tall (very tall), with realistic leg-to-torso proportions for that height |

