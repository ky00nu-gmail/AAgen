# C. 룩 (스타일링) — 상체 · 니샷 · 풀샷

입력: 데뷔 모델 이미지 1장(Image 1). 의상 지정 모드면 Image 2~N이 의상 참조. **ChatGPT에서는 한 대화에서 아래 3개 메시지를 순서대로 보낸다**(한 메시지에 3장을 요구하면 같은 크롭의 변주만 나온다).

프레이밍 확정값: 상체 = 머리 위 여백 있는 헤드샷(어깨 바로 아래 윗가슴까지, 얼굴이 높이의 40~45%) 1:1 · 니샷 = 머리~무릎 위(허벅지 중간) 1:1 · 풀샷 = 머리~신발+바닥 2:3.

### C-1. ChatGPT 3단계 (예시 옵션: 여성 · 170cm · 화이트 셔츠 · 베이지 슬랙스 · 로퍼 · 실버 목걸이 · 포즈 "손을 앞에 모으고 서기")

**1단계 · 상체 (모델 이미지 첨부)**

```text
Generate exactly ONE image, SQUARE format 1:1 (1024×1024). Framing: a tight head-and-shoulders headshot — the bottom edge cuts at the upper chest just below the shoulders, the face large in frame.

Image 1 is the model. Edit Image 1 into a square 1:1 head-and-shoulders headshot in beauty-lookbook style: a comfortable margin of empty backdrop above the head (about one tenth of the frame height), the bottom edge at the upper chest just below the shoulders, the face taking up roughly 40–45% of the frame height with the eyes a little above the center — the face, hair, neckline and collar of the top and any earrings or necklace clearly visible, the model centered. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front, framed head-and-shoulders; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Square 1:1 format, 1024×1024.
```

**2단계 · 니샷 (이어서)**

```text
Now generate exactly ONE NEW image, SQUARE format 1:1 (1024×1024), with a completely DIFFERENT and much WIDER framing than the previous image: a three-quarter shot from just above the head down to the mid-thigh (just above the knees) — the whole upper body, hips and thighs visible, the figure clearly smaller in frame with empty space above the head. Do NOT reuse or re-crop your previous output. Start again from the ORIGINAL attached photo (Image 1) and edit that.

Image 1 is the model. Edit Image 1 into a square 1:1 three-quarter lookbook crop from just above the top of the head down to the mid-thigh, just above the knees, the top, outer layer and the upper part of the bottoms all visible, the model centered. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories. Body proportions of a person about 170 cm tall (tall), with realistic leg-to-torso proportions for that height — keep the head-to-body ratio realistic and do not exaggerate leg length.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Square 1:1 format, 1024×1024.

The outfit, accessories, hair and styling must be exactly the same as in the previous image — only the framing is different.
```

**3단계 · 풀샷 (이어서)**

```text
Now generate exactly ONE NEW image in TALL PORTRAIT format 2:3 (1024×1536, vertical), with a completely DIFFERENT framing again: a FULL-BODY shot from the top of the head to the shoes with floor visible below the feet — the entire standing figure small in the tall frame, nothing cropped. Do NOT reuse or re-crop your previous outputs. Start again from the ORIGINAL attached photo (Image 1) and edit that.

Image 1 is the model. Edit Image 1 into a full-body shot from the top of the head to the shoes with a little floor visible below the feet, the whole outfit including shoes visible, the full figure filling the frame from top to bottom without cropping the head or feet, the model centered. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories. Body proportions of a person about 170 cm tall (tall), with realistic leg-to-torso proportions for that height — keep the head-to-body ratio realistic and do not exaggerate leg length.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Tall portrait format, 1024×1536.

The outfit, accessories, hair and styling must be exactly the same as in the previous images — only the framing is different.
```

### C-2. API용 개별 프롬프트 (니샷·풀샷은 상체 결과를 Image 2로 참조)

**상체**

```text
Image 1 is the model. Edit Image 1 into a square 1:1 head-and-shoulders headshot in beauty-lookbook style: a comfortable margin of empty backdrop above the head (about one tenth of the frame height), the bottom edge at the upper chest just below the shoulders, the face taking up roughly 40–45% of the frame height with the eyes a little above the center — the face, hair, neckline and collar of the top and any earrings or necklace clearly visible, the model centered. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front, framed head-and-shoulders; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Square 1:1 format, 1024×1024.
```

**니샷 (Image 2 = 상체 결과)**

```text
Image 1 is the model. Image 2 is a lookbook photo of the same model in the target outfit. Edit into a square 1:1 three-quarter lookbook crop from just above the top of the head down to the mid-thigh, just above the knees, the top, outer layer and the upper part of the bottoms all visible, the model centered. Wear EXACTLY the same outfit and accessories as in Image 2 — identical garments, colors, fit and styling; only the framing changes. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories. Body proportions of a person about 170 cm tall (tall), with realistic leg-to-torso proportions for that height — keep the head-to-body ratio realistic and do not exaggerate leg length.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Square 1:1 format, 1024×1024.
```

**풀샷 (Image 2 = 상체 결과)**

```text
Image 1 is the model. Image 2 is a lookbook photo of the same model in the target outfit. Edit into a full-body shot from the top of the head to the shoes with a little floor visible below the feet, the whole outfit including shoes visible, the full figure filling the frame from top to bottom without cropping the head or feet, the model centered. Wear EXACTLY the same outfit and accessories as in Image 2 — identical garments, colors, fit and styling; only the framing changes. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: standing with hands lightly clasped in front; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories. Body proportions of a person about 170 cm tall (tall), with realistic leg-to-torso proportions for that height — keep the head-to-body ratio realistic and do not exaggerate leg length.

Outfit: She wears a white crisp button-up shirt, beige tailored slacks, leather loafers. Accessories: a slim silver chain necklace. Fabrics and fit rendered realistically with natural folds and drape; garments and accessories clearly visible and brand-catalog clean.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Tall portrait format, 1024×1536.
```

### C-3. 의상 지정 모드 (참조 이미지로 입히기) — 상체 예시, 참조 3장 + 디렉션

```text
Image 1 is the model. Edit Image 1 into a square 1:1 head-and-shoulders headshot in beauty-lookbook style: a comfortable margin of empty backdrop above the head (about one tenth of the frame height), the bottom edge at the upper chest just below the shoulders, the face taking up roughly 40–45% of the frame height with the eyes a little above the center — the face, hair, neckline and collar of the top and any earrings or necklace clearly visible, the model centered. Keep the model's identity 100% identical to Image 1: the exact same face, facial features, skin tone, hair style and hair color, and apparent age. Pose: unspecified pose — a natural, relaxed standing pose of the stylist's choice, framed head-and-shoulders; face toward the camera, head upright, eyes into the lens, camera at eye level. Change ONLY the clothing and accessories.

Images 2 to 4 are reference photos of garments and accessories (some may show the front and back of the same item). Every item shown in them MUST be worn by the model, reproduced exactly — the same color, fabric, pattern, print, cut, length, fit and details (buttons, seams, logos, hardware); use a front view for the visible front and a back view for construction and length. Do not substitute similar items or invent replacements for referenced pieces. For parts of the outfit NOT shown in the references: follow this direction — "하의는 와이드 데님, 스니커즈" — and where neither applies, choose simple, clean, neutral pieces that complement the referenced items. Fabrics and fit rendered realistically with natural folds and drape, worn naturally on her body.

Background: a seamless, flat, near-white light-gray studio backdrop. Lighting: bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes. Skin: luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, finished clean like a retouched beauty campaign. Color: a clean, bright, slightly cool color grade with neutral whites. Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.

Photorealistic, premium brand lookbook quality. Square 1:1 format, 1024×1024.
```

### 옵션 사전 — 룩

**프리셋**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 캐주얼 | relaxed everyday casual styling |
| 미니멀 | clean minimal styling in neutral tones |
| 스트리트 | urban streetwear styling |
| 오피스 | polished smart office styling |
| 스포티 | athleisure sportswear styling |
| 클래식 | timeless classic tailored styling |
| 럭셔리 | understated luxury brand styling with premium fabrics |
| 하이패션 | bold high-fashion editorial styling |
| 로맨틱 | soft romantic feminine styling |
| 빈티지 | vintage-inspired styling |

**상의**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 티셔츠 | a plain crew-neck t-shirt |
| 오버핏 티셔츠 | an oversized boxy t-shirt |
| 셔츠 | a crisp button-up shirt |
| 오버핏 셔츠 | an oversized relaxed shirt |
| 블라우스 | a soft blouse |
| 니트 | a fine-knit sweater |
| 후디 | a hoodie |
| 크롭탑 | a fitted crop top |
| 캐미솔 | a camisole top |
| 터틀넥 | a slim turtleneck |
| 폴로 | a polo shirt |
| 탱크탑 | a ribbed tank top |
| 스웻셔츠 | a sweatshirt |
| 베스트 | a knit vest over a shirt |
| 원피스 | a simple dress |

**하의**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 데님 | straight-leg jeans |
| 와이드 데님 | wide-leg jeans |
| 슬랙스 | tailored slacks |
| 와이드 팬츠 | wide-leg trousers |
| 카고 | cargo pants |
| 조거 | jogger pants |
| 쇼츠 | shorts |
| 미니스커트 | a mini skirt |
| 미디스커트 | a midi skirt |
| 롱스커트 | a long skirt |
| 레깅스 | leggings |
| 치노 | chino pants |

**아우터**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 없음 |  |
| 블레이저 | a tailored blazer |
| 가죽 재킷 | a leather jacket |
| 트렌치코트 | a trench coat |
| 데님 재킷 | a denim jacket |
| 울 코트 | a long wool coat |
| 카디건 | a cardigan |
| 바람막이 | a light windbreaker |
| 패딩 | a puffer jacket |
| 봄버 | a bomber jacket |
| 베스트 | a padded vest |

**신발**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 스니커즈 | clean white sneakers |
| 로퍼 | leather loafers |
| 첼시 부츠 | chelsea boots |
| 앵클 부츠 | ankle boots |
| 힐 | pointed heels |
| 샌들 | strappy sandals |
| 더비 | derby shoes |
| 슬리퍼 | slide sandals |
| 러닝화 | running shoes |

**악세서리**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 실버 목걸이 | a slim silver chain necklace |
| 골드 목걸이 | a delicate gold necklace |
| 펄 목걸이 | a pearl necklace |
| 작은 후프 이어링 | small hoop earrings |
| 드롭 이어링 | drop earrings |
| 안경 | thin metal-frame glasses |
| 선글라스 | sunglasses |
| 볼캡 | a baseball cap |
| 비니 | a beanie |
| 버킷햇 | a bucket hat |
| 시계 | a minimal wristwatch |
| 링 | a couple of thin rings |
| 스카프 | a silk scarf |
| 헤드폰 | over-ear headphones around the neck |
| 토트백 | a leather tote bag |
| 크로스백 | a small crossbody bag |
| 벨트 | a slim leather belt |
| 초커 | a black choker |

**색상**

| 표시 이름(KO) | 프롬프트용 영어 |
|---|---|
| 블랙 | black |
| 화이트 | white |
| 오프화이트 | off-white |
| 그레이 | gray |
| 차콜 | charcoal |
| 네이비 | navy |
| 베이지 | beige |
| 카멜 | camel |
| 브라운 | brown |
| 올리브 | olive |
| 카키 | khaki |
| 레드 | red |
| 버건디 | burgundy |
| 블루 | blue |
| 스카이블루 | sky blue |
| 그린 | green |
| 핑크 | pink |
| 라벤더 | lavender |
| 옐로 | yellow |
| 크림 | cream |
| 데님블루 | denim blue |

**포즈** (세 컷에 동일 적용 · 상체는 head-and-shoulders 프레임 표기 · 지정 안 함 = unspecified pose, 정면)

| 표시 이름(KO) | 몸 자세 영어 | 머리·시선 영어 |
|---|---|---|
| 정면으로 자연스럽게 서기 | standing naturally, facing forward | (기본: face toward the camera, head upright, eyes into the lens) |
| 편하게 서기 | relaxed standing pose | (기본: face toward the camera, head upright, eyes into the lens) |
| 손을 앞에 모으고 서기 | standing with hands lightly clasped in front | (기본: face toward the camera, head upright, eyes into the lens) |
| 팔을 자연스럽게 내리고 서기 | standing with arms relaxed at the sides | (기본: face toward the camera, head upright, eyes into the lens) |
| 한 손을 허리에 두고 서기 | standing with one hand on the hip | (기본: face toward the camera, head upright, eyes into the lens) |
| 한 손을 스테이션에 올리기 | standing with one hand lightly resting on the station | (기본: face toward the camera, head upright, eyes into the lens) |
| 정면을 보며 대화하기 | facing forward and speaking naturally | face toward the camera as if speaking to the viewer, eyes into the lens |
| 손짓하며 설명하기 | speaking with a natural one-hand gesture | (기본: face toward the camera, head upright, eyes into the lens) |
| 두 손을 펼쳐 설명하기 | explaining with both hands slightly open | (기본: face toward the camera, head upright, eyes into the lens) |
| 가볍게 인사하기 | giving a small friendly wave | (기본: face toward the camera, head upright, eyes into the lens) |
| 고개를 살짝 끄덕이기 | slightly nodding while engaging with the viewer | head in a slight nod, eyes toward the viewer |
| 몸을 살짝 틀어 서기 | standing at a slight three-quarter angle | face turned toward the camera, eyes into the lens |
| 걷다가 멈춰 바라보기 | pausing mid-step and looking forward | (기본: face toward the camera, head upright, eyes into the lens) |

