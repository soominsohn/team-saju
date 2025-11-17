# 우리팀 사주 오행 궁합 — 서비스 기획·디벨롭 플랜 (v1)

> 팀원들의 생년월일·출생시·성별을 입력하면 개인 사주 요약과 팀 단위 오행(목·화·토·금·수) 분포/상생·상극 기반 궁합을 시각화해주는 웹 서비스 기획 및 기술 설계 문서입니다.
> 

---

## 1) 목표 & 핵심 가치

- **팀 건강도 가시화**: 팀 전체 오행 균형과 상생/상극 흐름을 직관적으로 보여줌.
- **개인 인사이트**: 개인 사주 요약(일간, 오행 편중, 보완 요소) 제공.
- **실무 적용성**: 팀 빌딩/배치/커뮤니케이션 팁을 데이터로 제안.
- **프라이버시 우선**: 민감정보 최소 수집·가명화·옵트인.

### 성공 지표 (KPI)

- 팀 분석 리포트 생성률, 재분석 재방문율, 팀원별 결과 열람 완료율.
- 추천 액션(예: “회의 진행자 교대”) 실천율(자가 체크), 만족도 NPS.

---

## 2) 사용자 시나리오 & UX 플로우

1. **팀 생성** → 팀 이름·목적 입력 → 초대 링크 생성 (토큰 포함)
2. **팀원 입력** → 이름(닉네임 가능), 성별(옵션), 생년월일(양력/음력), 출생시(모르면 미상) 입력
3. **개인 리포트** (요약 카드):
    - 일간/사주팔자 8자(천간/지지), 개인 오행 분포 레이더/바차트
    - 편중/결핍 오행, **보완 팁**(생활/커뮤니케이션)
4. **팀 리포트**:
    - 팀 오행 분포 히트맵/도넛, 상생/상극 네트워크 그래프
    - 페어·소그룹 궁합 점수, 리스크/보완 조합 추천
    - **역할 제안**: 진행형/아이디어/정리형 등 롤 추천
5. **공유/관리**: 링크 공유, 조회 권한(팀장/팀원/외부), 만료 설정

### 핵심 화면 컴포넌트

- 입력폼(달력·출생시 선택), 로딩/계산 상태, 개인/팀 대시보드, 네트워크 그래프, 다운로드(PDF/PNG)

---

## 3) 점수 모델(초안) — 투명·가볍게 설명 가능한 규칙 기반

> 복잡한 명리 해석을 완전 대체하지 않고, 오행 중심의 정량화된 메트릭으로 MVP를 구성합니다.
> 

### 3.1 계산 기본

- 8자(연·월·일·시) **천간/지지 → 오행 매핑**
- 각 오행 점수 = (천간 가중 w₁ × 개수 + 지지 가중 w₂ × 개수) × 분포 보정
    - 권장 초기값: w₁=1.2, w₂=1.0, 분포보정=소프트맥스/정규화
- *일간(주체 오행)**을 개인 성향 기준점으로 채택 (설명 텍스트 생성)

### 3.2 상생/상극 매트릭스

- **상생**: 목→화→토→금→수→목 (가중 +1.0)
- **상극**: 목⊥토, 화⊥금, 토⊥수, 금⊥목, 수⊥화 (가중 −1.0)

### 3.3 개인 궁합(두 사람)

- A의 주체오행 vs B의 오행 분포, B의 주체오행 vs A의 분포 각각 상생/상극 가중치 적용
- **커뮤니케이션 보완성 점수** = (A→B 상생합 + B→A 상생합) − (상극 페널티)
- 정규화하여 0~100점

### 3.4 팀 궁합(다수)

- **분포 균형 지수**(Entropy·분산 역수 혼합): 오행 균등할수록 ▲
- **상생 흐름 지수**: 오행 사이 유량(목→화 등) 합산
- **상극 응집 지수**: 상극 엣지 누적(페널티)
- **핵심 역할 커버리지**: 주체오행 기반 롤 매핑이 골고루 있으면 ▲
- 최종 **팀 궁합 스코어** = α·분포균형 + β·상생 − γ·상극 + δ·커버리지 (권장: α=0.25,β=0.35,γ=0.25,δ=0.15)

### 3.5 해석 가이드 텍스트(템플릿)

- 편중 → “금 과다: 의사결정 빠르나 경직 가능, ‘수’ 성향 동료가 완화”
- 결핍 → “목 결핍: 시작·기획 동력 부족, ‘목’ 성향 동료의 발제 역할 유익”
- 상극 높음 → “갈등 가능 지점: 피드백 규칙·시간제한 명문화 권장”

---

## 4) 데이터 모델 (PostgreSQL)

**teams**(id, name, purpose, owner_id, share_token, expires_at, created_at)
**members**(id, team_id, display_name, gender, birth_date, birth_time_nullable, tz, created_at)
**charts**(id, member_id, year_stem, year_branch, month_stem, month_branch, day_stem, day_branch, hour_stem, hour_branch, created_at)
**elements**(id, member_id, wood, fire, earth, metal, water, dominant, created_at)
**pair_scores**(id, team_id, member_a, member_b, score, strengths, risks, created_at)
**team_scores**(id, team_id, balance_idx, nourish_idx, conflict_idx, role_coverage, final_score, created_at)
**audit_logs**(id, actor, action, target, at)

> 개인 식별 최소화: display_name은 닉네임 허용, 생시는 모름 선택 시 “미상” 처리(‘시주’ 미계산/보정).
> 

---

## 5) 시스템 아키텍처

- **프런트엔드**: Next.js(App Router) + Tailwind + Recharts(차트) + d3-force(네트워크)
- **DB**: **Next.js + Prisma + PostgreSQL**
- **Auth/Access**: Magic link(팀장만 편집), 팀원 링크 토큰형 가조회
- **배포**: Vercel(Front) + Fly.io/Render/Heroku 대체(Back) or K8s
- **관측성**: OpenTelemetry(요청 트레이스), Sentry(프런트/백)
- **PDF/PNG 내보내기**: 서버 사이드 HTML→PDF 렌더러(Playwright/Chromium)

---

## 6) API 설계 (예시)

POST /api/teams {name,purpose,expiresAt}

POST /api/teams/{id}/members {displayName,gender?,birthDate, birthTime?, tz}

POST /api/members/{id}/analyze → {stemsBranches, elements, tips}

GET  /api/teams/{id}/report → {teamElements, network, scores, insights}

GET  /api/teams/{id}/pairs?min=80 → 상위 궁합 페어 리스트

POST /api/teams/{id}/export/pdf → PDF 링크

응답 샘플(발췌):

{

"elements": {"wood":0.8,"fire":0.4,"earth":0.6,"metal":1.2,"water":0.3,"dominant":"metal"},

"pairScore": {"score":82, "strengths":["상생 흐름(수→목)", "의사결정 보완"], "risks":["금-화 상극"]}

}

---

## 7) 간지·오행 매핑 및 알고리즘 상세 (MVP 규칙표)

### 7.1 천간(10) ↔ 오행

- 갑(甲)·을(乙)=**목**, 병(丙)·정(丁)=**화**, 무(戊)·기(己)=**토**, 경(庚)·신(辛)=**금**, 임(壬)·계(癸)=**수**

### 7.2 지지(12) ↔ 오행(주 오행 기준)

- 자=**수**, 축=**토**, 인=**목**, 묘=**목**, 진=**토**, 사=**화**, 오=**화**, 미=**토**, 신=**금**, 유=**금**, 술=**토**, 해=**수**

> 심화: 지장간까지 계산하는 Pro 모드(후속)
> 

### 7.3 상생/상극 가중치 행렬(요약)

- 상생(+1): 목→화, 화→토, 토→금, 금→수, 수→목
- 상극(−1): 목⊥토, 화⊥금, 토⊥수, 금⊥목, 수⊥화

### 7.4 시주 미상 보정

- 출생시 미상 시, **시간 지지/천간 제외**하고 분포 정규화. 신뢰도 지수↓ (UI에 배지 표기)

### 7.5 팀 스코어 의사코드

for member in team:

elements_m[5] = calc_elements(member) // 0..1 정규화

team_vector = sum(elements_m) // 팀 합

balance = entropy_norm(team_vector)

nourish = sum_over_pairs( max(0, W_nourish[x->y]) * team_flow )

conflict = sum_over_pairs( max(0, W_conflict[x-y]) * team_tension )

role_coverage = coverage(map_role_by_dominant(member))

score = 100 * (0.25*balance + 0.35*nourish - 0.25*conflict + 0.15*role_coverage)

---

## 8) 디자인 가이드(시각화)

- **도넛 차트**: 팀 오행 분포(목·화·토·금·수)
- **레이더 차트**: 개인/팀 비교
- **네트워크 그래프**: 노드=팀원, 엣지 색=상생(굵고 진함), 상극(얇고 점선)
- **점수 배지**: 0~100, 80+ : Excellent / 60~79 : Good / 40~59 : Caution / <40 : Risk
- **카피 템플릿**: “우리 팀은 *금*이 강하고 *목*이 부족—발제·기획형 지원 추천”

---

## 9) 프라이버시·윤리·법무

- **수집 최소화**: 실명 대신 닉네임 기본값, 성별·출생시 모두 *옵션*
- **보관 기간**: 팀장 설정 만료일 도달 시 자동 삭제(기본 30일)
- **암호화**: 전송 TLS, 저장 시 PII 컬럼 암호화(KMS), 감사로그
- **동의/철회**: 팀원 동의 체크박스, 언제든 리포트 삭제 요청
- **면책**: 엔터테인먼트/팀빌딩 목적, 인사평가에 사용 금지 고지

---

## 10) 운영 & 관리자 기능

- 팀 리포트 잠금/공유 만료 링크 재발급, 삭제 예약
- 익명화 모드(개인 상세 비공개, 팀 분포만 노출)
- 장애 모니터링 대시보드(성능지표: 분석 평균 지연, 실패율)

---

## 11) 개발 로드맵

**Phase 0 — POC (1~2주)**

- 기본 간지 계산, 오행 매핑, 개인/팀 분포 시각화, 정적 점수 산식 적용

**Phase 1 — MVP (2~4주)**

- 팀 공유 링크, PDF 리포트, 페어/소그룹 궁합, 역할 추천, SSO(선택)

**Phase 2 — Pro(고도화)**

- 지장간·형충파해 합충형벌, 운세(대운/세운) 옵션, ML 기반 문구 추천

---

## 12) 엔지니어링 상세

- **패키지 분리**: `eph-core`(간지/오행), `compat-core`(스코어), `report-kit`(PDF)
- **테스트**: 규칙표 스냅샷 테스트(100케이스), 퍼지 테스트(랜덤 생년월일)
- **성능**: O(n²) 페어 계산 → 100명 팀까지 1s 내; 그 이상은 샘플링/배치
- **국제화**: i18n(ko→en), 타임존 안전 (Asia/Seoul 기본)

---

## 13) 예시 코드 스니펫

// Day Stem/Branch 계산은 천문역법 라이브러리 사용 or 내장 알고리즘

fun mapStemToElement(stem: Stem) = when(stem){

GAP, EUL -> WOOD

BYEONG, JEONG -> FIRE

MU, GI -> EARTH

GYEONG, SIN -> METAL

IM, GYE -> WATER

}

fun personElements(chart: Chart): Elements {

val stemElems = listOf(chart.yStem, chart.mStem, chart.dStem, chart.hStem).map(::mapStemToElement)

val branchElems = listOf(chart.yBranch, chart.mBranch, chart.dBranch, chart.hBranch).map(::mapBranchToElement)

val counts = FloatArray(5)

stemElems.forEach { counts[it.idx] += 1.2f }

branchElems.forEach { counts[it.idx] += 1.0f }

val sum = counts.sum()

return Elements(*(counts.map{it/sum}.toFloatArray()))

}

---

## 14) 팀 인사이트 예시(자동 생성 템플릿)

- “우리팀은 **수→목→화** 상생 흐름이 강하고, **토** 결핍이 뚜렷합니다. 일정·리스크 관리 역할 지정이 유효합니다.”
- “A–B는 **금–화 상극**이 높아 즉흥 피드백 시 마찰 가능. *어젠다·타임박스* 사용 권장.”

---

## 15) 유지보수 & 확장

- **룰 엔진 테이블화**: 상수(YAML/DB)로 외부화 → A/B테스트 가능
- **플러그인**: 조직도 연동(OKR/역할), 캘린더(회의 로테이션 추천)
- **Export SDK**: 사내 슬랙봇/노션 위젯

---

## 16) 리스크 & 대응

- **정확성 논란**: 해석 과신 방지 문구, 규칙 공개(투명성)
- **민감정보**: 삭제/만료/암호화 기본값 강제, 감사 추적
- **과부하**: 팀 대량 업로드 시 큐잉/비동기 리포트 생성

---

## 17) 체크리스트 (런칭 전)

- 

---

### 부록 A. 용어 요약

- **일간**: 개인 성향의 기준이 되는 오행(일간의 오행)
- **상생/상극**: 오행 간 보완/충돌 관계
- **형충파해**: 고급 관계 규칙(후속)

### 부록 B. 역할 매핑(초안)

- 목: 개척/기획, 화: 추진/커뮤니케이션, 토: 정리/PM, 금: 품질/의사결정, 수: 정보/연구
