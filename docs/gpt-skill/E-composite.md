# E. 룩 + 배경 합성

입력: Image 1 = 룩, Image 2 = 배경(없으면 텍스트 장면). 모델·의상·포즈 100% 유지, 라이트그레이 배경만 교체.

**풀샷 · 배경 이미지 있음 · 출력 룩과 동일**

```text
Image 1 is a lookbook photo of a model on a flat light-gray studio backdrop. Image 2 is the background scene. Composite the model into that scene.

Keep the model 100% identical to Image 1 — face, hair, expression, gaze, pose, body, and every garment and accessory exactly as they are, with the SAME framing, crop and canvas as Image 1. Do not restyle, redraw or move the model.

Replace ONLY the gray backdrop with the environment of Image 2, seen from the same eye-level camera. Integrate the model naturally: apply the scene's lighting direction, color temperature and contrast to the model, the feet planted on the visible floor with a natural soft contact shadow and correct scale, and a slight depth of field on the background so the model remains the sharpest element.

No text, no extra people. Photorealistic, premium campaign quality. Tall portrait format 2:3, 1024×1536.
```

**상체 · 텍스트 장면(카페) · 출력 9:16 세로**

```text
Image 1 is a lookbook photo of a model on a flat light-gray studio backdrop. There is no background image; use this scene: a modern cafe interior with warm wood, large windows and soft daylight. Composite the model into that scene.

Keep the model 100% identical to Image 1 — face, hair, expression, gaze, pose, body, and every garment and accessory exactly as they are, at the same scale, only the canvas around the model changes. Do not restyle, redraw or move the model.

Replace ONLY the gray backdrop with the environment, seen from the same eye-level camera. Integrate the model naturally: apply the scene's lighting direction, color temperature and contrast to the model, natural soft ambient shadowing consistent with the scene, and a slight depth of field on the background so the model remains the sharpest element.

No text, no extra people. Photorealistic, premium campaign quality. Output format: vertical 9:16 (mobile / kiosk screen). Extend the scene to fill the new canvas — never crop the model; keep the model at the same size and position relative to the frame center and let the environment continue naturally into the added area.
```

**출력 비율 사전**

| 표시 | 프롬프트 문구 | API 캔버스(가까운 것) → 센터 크롭 |
|---|---|---|
| 1:1 | square 1:1 | 1024x1024 |
| 3:4 세로 | portrait 3:4 | 1024x1536 |
| 2:3 세로 | tall portrait 2:3 | 1024x1536 |
| 9:16 세로 | vertical 9:16 (mobile / kiosk screen) | 1024x1536 |
| 4:3 가로 | landscape 4:3 | 1536x1024 |
| 3:2 가로 | landscape 3:2 | 1536x1024 |
| 16:9 가로 | widescreen 16:9 | 1536x1024 |

