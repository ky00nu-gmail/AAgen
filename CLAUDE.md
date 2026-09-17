# AI 모델 만들기 (AI_Avatar) — 작업 규칙

내부용 정적 웹앱. blurblur.ai `/make/model/create` 화면 룩을 그대로 옮긴 "AI 모델 만들기" + 룩(스타일링) + 배경 단계. 빌드 없음, 서버 없음.

## 실행
- `python3 -m http.server 8765` 후 `http://localhost:8765` (또는 `index.html` 직접 열기). Claude Code 미리보기는 `.claude/launch.json`의 `static`.
- OpenAI 호출은 브라우저에서 직접 나간다(키는 각자 "API 설정" → localStorage). Claude 데스크톱 내장 브라우저는 api.openai.com POST가 막혀 있어 실제 생성 확인은 Chrome에서.

## 파일
- `index.html` — 화면·상태·라우팅(#create / #models / #model/<id> / #style/<id> / #bg). 인라인 CSS/JS 단일 파일.
- `js/prompt.js` — 프롬프트 엔진(DOM 의존 없음, `window.PromptEngine` / CommonJS). 모든 프롬프트 문구는 여기서만 바꾼다.
- `js/adjust.js` — 얼굴 조정(MediaPipe + 로컬 워프/피부/톤). `js/engine.js` — OpenAI Images API 어댑터.
- `tools/export-gpt-skill.js` → `docs/gpt-skill/`(AI_model.md, INSTRUCTIONS.md, A~F). `tools/sample-prompts.js` → `docs/prompt-samples.md`.
- 기능 목록과 확정값은 `README.md`가 기준.

## 반드시 지킬 것
- **디자인 기준은 blurblur 캡처와의 시각적 일치**: 모노톤, 검은 선택 상태, 4px 라운드, 넓은 단일 컬럼, Pretendard. 새 화면도 같은 룩으로.
- **js 파일을 고치면 `index.html`의 `<script src="js/*.js?v=NNN">` 버전 3개를 함께 올린다**(브라우저 캐시). 안 올리면 구버전이 로드된다.
- `js/prompt.js`를 고치면 `node tools/export-gpt-skill.js`로 스킬 문서를 재생성해 함께 커밋한다. 문서를 손으로 고치지 않는다.
- 상태는 IndexedDB(`aimodel.store`, 키 `aimodel.create.v1`, 폴백 localStorage)에 저장된다. `persist()`/`restore()`(async)만 통해 읽고 쓴다. `S`에 새 필드를 추가하면 `PERSIST` 목록과 `restore()`의 기본값·busy 초기화도 함께 손본다.
- 내부용이므로 비용·잔액·약관·본인 확인·IP 안내·Pricing UI를 다시 넣지 않는다.

## 프롬프트 규칙(사용자 검증 완료 — 임의로 바꾸지 말 것)
- 얼굴 단계: 자세는 항상 **정면 증명사진**으로 정렬(POSE_LOCK), 배경은 항상 flat near-white light-gray, 인종·나이대는 원본 유지. 부정 목록·texture/pores/sharp 어휘 금지.
- 3단계: 그대로(keep)=편집 지시·얼굴 100% 고정·선택 옵션만 / 약하게(light)=리슛 프레임·하이키 정면 뷰티광·촉촉한 피부 / 글로우(glow)=프리미엄 K-뷰티 캠페인·과감한 이상화·wet-look 도자기 피부. 3단계는 한 장 3패널(KEEP/NATURAL/GLOW)로 만들어 패널을 골라 데뷔한다.
- 룩: 상체(1:1, 머리 위 여백 있는 헤드샷, 어깨 아래 윗가슴까지) · 니샷(1:1, 머리~무릎 위) · 풀샷(2:3, 머리~신발+바닥)을 **각각 별도 이미지**로. 얼굴은 클린 어휘만(FACE_DETAIL/LOOK_SKIN). ChatGPT는 한 메시지에 이미지 1장만 만들므로 **연속 메시지 3개**(chatSteps)로 준다. 포즈는 사용자 확정 13종 영어 매핑 그대로.
- 배경: 플레이트에는 사람·텍스트 없음, 중앙 앞쪽 비움, 바닥 보임. 추천은 개수·카테고리를 고정하지 않는 자유 탐색(bgFreePrompt). 합성은 프롬프트가 아니라 브라우저 합성기(cutoutPerson + 캔버스)로 한다.
- 결과 이미지는 사용자가 GPT에서 받아 올리는 흐름이 기본이라, 모든 리스트 끝에 직접 업로드 슬롯이 있어야 한다.

## 협업
- `main`은 항상 동작 상태. 수정은 브랜치 → PR. `index.html` 단일 파일이라 같은 영역 동시 수정 시 충돌이 잦으니 작업 영역(Create/Models/Style/Backgrounds/prompt.js)을 먼저 공유한다.
- 버전 확정은 `git tag verN`. `releases/`는 태그 이전의 수동 스냅샷이며 git에는 올리지 않는다(.gitignore).
- 커밋 전 문법 확인: `node -e "const s=require('fs').readFileSync('index.html','utf8');for(const b of s.match(/<script>([\s\S]*?)<\/script>/g)){new Function(b.slice(8,-9))}"` 와 `node -e "require('./js/prompt.js')"`.
