# F. 고정 문단 (참조)

**정면 자세 고정(POSE_LOCK)**

```text
Pose: a straight-on frontal ID-photo pose regardless of the angle in the input — face and shoulders square to the camera, head upright with no tilt or turn, eyes level and looking directly into the lens, camera at eye level, head-and-shoulders framing centered. If the input photo is taken from an angle or the head is tilted, rotate the person to this frontal pose while keeping every facial feature and proportion faithful to them.
```

**룩 얼굴 디테일(FACE_DETAIL)**

```text
Render the face with the same clarity and cleanliness as the input photo, finished like a retouched beauty campaign: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth flowing hair — a clean high-fidelity image with smooth tonal gradients and no added noise, speckles, blotches or artificial texture.
```

**얼굴 보정 패스(FACE_FIX, 얼굴 크롭 1024² 재편집용)**

```text
Image 1 is a close crop of a person's face from a lookbook photo. Re-render this exact crop as a clean, high-fidelity beauty-campaign close-up of the SAME person: identical identity, facial features, expression, gaze, head angle, hair, makeup, earrings and clothing edges, identical framing and background. Change nothing about who they are or how they are posed — only restore clarity: smooth, even, luminous skin with soft dewy highlights, clean well-defined eyes with a catchlight, neat brows and lashes, glossy lips, smooth hair strands, smooth tonal gradients, no noise, speckles, blotches or artificial texture. Photorealistic, square 1:1.
```

**룩 배경·조명·피부·색(LOOK)**

| 키 | 문구 |
|---|---|
| backdrop | a seamless, flat, near-white light-gray studio backdrop |
| keyLight | bright, high-key soft frontal beauty light with minimal shadows and a soft catchlight in the eyes |
| skin | luminous, even, dewy skin with a soft radiant glow on the cheekbones and nose bridge, blemishes and dullness cleared, while fine pores and natural skin grain stay visible |
| grade | a clean, bright, slightly cool color grade with neutral whites |
| top | a plain black crew-neck tee |
