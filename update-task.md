# 팀 사주 알고리즘 및 리포트 개선 계획

## 📊 현재 상태 분석

### 이미 구현된 기능
✅ **기본 사주 계산 엔진** (lib/elements.ts)
- 천간/지지 → 오행 변환
- ElementProfile 정규화 (총합 1.0)
- 개인별 주체오행(dominant element) 판별
- 결핍/편중 오행 인사이트

✅ **팀 점수 시스템** (lib/team.ts)
- 균형 지수 (entropy 기반)
- 상생 흐름 지수 (nourishFlow)
- 상극 페널티 (conflictPenalty)
- 역할 커버리지 (roleCoverage)
- 최종 점수 공식: `0.25*balance + 0.35*nourish + 0.25*conflict + 0.15*role`

✅ **1:1 궁합 계산** (lib/compat.ts)
- directionalScore (A→B, B→A 상생/상극)
- 결핍 보완 감지
- strengths/risks 텍스트 생성

✅ **형충합해 분석** (lib/relations.ts)
- 지지 기반 clash/harm/combine/punish 관계 감지
- 팀원 간 특수 관계 인사이트

✅ **시각화 컴포넌트**
- TeamElementPie: 팀 전체 오행 분포
- MemberRadar: 개인별 오행 레이더 (절대값 0-8)
- CompatibilityGraph: 팀원 간 관계 네트워크 (d3-force)

---

## 🎯 개선 목표 및 우선순위

### Phase 1: 알고리즘 고도화 (Core Logic) 🔥 우선순위 높음
**목표**: 더 정교한 궁합 점수 + 역할 프로파일링

#### 1-1. 1:1 궁합 알고리즘 강화
**현재**: 단순 상생/상극 스코어만 계산
**개선**:
```typescript
// lib/compat.ts 개선
type EnhancedPairScore = {
  score: number; // 0-100
  breakdown: {
    elementHarmony: number;     // 오행 상생/상극 점수 (±20)
    roleCompatibility: number;  // 성향 조합 점수 (±15)
    ganjiHarmony: number;       // 천간/지지 합충 점수 (±25)
    elementBalance: number;     // 기운 균형 보정 (±10)
  };
  insights: {
    strengths: string[];
    risks: string[];
    recommendations: string[];  // NEW: 구체적 조언
  };
};
```

**추가 계산 요소**:
1. **천간 합/충 점수** (일간 기준)
   - 천간 합(甲己合, 乙庚合 등) → +25
   - 천간 충(甲庚충, 乙辛충 등) → -25

2. **지지 삼합/육합/형충파해**
   - 이미 relations.ts에 clash/combine 있음 → 점수에 반영
   - 삼합(申子辰, 亥卯未 등) 감지 추가 → +30

3. **역할 시너지 매트릭스**
   ```typescript
   const ROLE_SYNERGY: Record<string, Record<string, number>> = {
     'leader': { 'analyst': 10, 'creative': 5, 'coordinator': 8 },
     'creative': { 'leader': 8, 'analyst': 3 },
     // ...
   };
   ```

#### 1-2. 역할 프로파일링 시스템 신규 구축
**파일**: `lib/roles.ts` (NEW)

```typescript
export enum TeamRole {
  LEADER = "leader",           // 火 과다 → 추진력
  STRATEGIST = "strategist",   // 木 과다 → 기획/성장
  COORDINATOR = "coordinator", // 土 과다 → 조율/안정
  ANALYST = "analyst",         // 金 과다 → 분석/구조
  COMMUNICATOR = "communicator" // 水 과다 → 소통/유연
}

type RoleProfile = {
  primary: TeamRole;
  secondary?: TeamRole;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

export function deriveRole(
  chart: GanJiChart,
  profile: ElementProfile,
  tenGods: TenGodProfile
): RoleProfile;
```

**로직**:
1. 주체오행(dominant) 기반 1차 분류
2. 십신 분포로 2차 보정 (식신 많으면 creative 가산)
3. 극단값(>0.4) 감지 → 강점과 약점 동시 언급

#### 1-3. 팀 전체 인사이트 강화
**파일**: `lib/insights.ts` (NEW)

```typescript
export type TeamInsight = {
  category: 'balance' | 'energy' | 'risk' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedMembers?: string[]; // 관련 멤버 ID
  recommendation?: string;
};

export function generateTeamInsights(
  profiles: ElementProfile[],
  pairScores: PairCompatibility[],
  branchRelations: BranchRelationInsight[]
): TeamInsight[];
```

**생성 규칙 예시**:
- 팀 전체 火>0.35 → "추진력 강한 팀, 단 번아웃 주의"
- 특정 페어 score<30 → "A-B 관계 주의, C가 중재 역할 추천"
- 모든 멤버 土<0.1 → "조율자 부재, 외부 퍼실리테이터 고려"

---

### Phase 2: UI/UX 대시보드 개선 🎨 우선순위 중간

#### 2-1. 팀 에너지 다이얼 (Team Energy Dashboard)
**컴포넌트**: `components/dashboard/TeamEnergyDial.tsx` (NEW)

**표시 요소**:
- 조화도 (harmony): 0-100 게이지
- 갈등도 (conflict): 0-100 게이지
- 협업 시너지 (synergy): 0-100 게이지

**데이터 소스**:
```typescript
// lib/team.ts에 추가
export type TeamEnergyMetrics = {
  harmony: number;    // = balanceIdx
  conflict: number;   // = 100 - conflictIdx
  synergy: number;    // = (nourishIdx + roleCoverage) / 2
};
```

#### 2-2. 팀 관계 네트워크 개선
**현재**: CompatibilityGraph 기본 노드-엣지만 표시
**개선**:
- 엣지 색상: 초록(score>70), 회색(40-70), 빨강(<40)
- 노드 크기: 역할별 차등 (리더형 크게)
- 호버 시 상세 정보 툴팁
- 클릭 시 1:1 상세 궁합 모달

#### 2-3. 역할 카드 UI
**컴포넌트**: `components/report/RoleCard.tsx` (NEW)

```typescript
// 멤버별 역할 카드
<RoleCard
  member={member}
  role={roleProfile}
  teammates={[...]} // 추천 협업 파트너
/>
```

**디자인**:
- 역할 아이콘 + 이름
- 강점 3개 (배지)
- 약점 1-2개 (주의 아이콘)
- 추천 협업 멤버 (작은 아바타)

#### 2-4. 인사이트 카드 섹션
**컴포넌트**: `components/report/InsightCards.tsx` (NEW)

```typescript
<InsightCards insights={teamInsights} />
```

**카드 디자인**:
- 우선순위별 색상 (high=빨강, medium=노랑, low=파랑)
- 아이콘 + 제목 + 설명
- 관련 멤버 표시
- 액션 버튼 ("자세히 보기", "조언 받기")

---

### Phase 3: 데이터 및 API 확장 🔧 우선순위 낮음

#### 3-1. 역할 데이터 DB 저장
**Prisma 스키마 추가**:
```prisma
model MemberRole {
  id            String   @id @default(cuid())
  memberId      String   @unique
  member        Member   @relation(fields: [memberId], references: [id])
  primaryRole   String   // TeamRole enum
  secondaryRole String?
  strengths     String[] // JSON array
  weaknesses    String[]
  createdAt     DateTime @default(now())
}
```

#### 3-2. 인사이트 캐싱
```prisma
model TeamInsights {
  id          String   @id @default(cuid())
  teamId      String   @unique
  team        Team     @relation(fields: [teamId], references: [id])
  insights    Json     // TeamInsight[]
  generatedAt DateTime @default(now())
}
```

#### 3-3. API 라우트 추가
- `GET /api/teams/[teamId]/insights` → 팀 인사이트 조회
- `GET /api/teams/[teamId]/roles` → 역할 프로필 조회
- `POST /api/teams/[teamId]/regenerate` → 재계산 트리거

---

## 📅 구현 단계별 로드맵

### Week 1-2: Phase 1 알고리즘 (Core)
- [ ] Day 1-2: lib/roles.ts 역할 프로파일링 시스템
- [ ] Day 3-4: lib/compat.ts 궁합 알고리즘 강화 (천간합충, 지지삼합)
- [ ] Day 5-6: lib/insights.ts 팀 인사이트 생성 엔진
- [ ] Day 7: lib/services/reportService.ts에 통합
- [ ] Day 8-10: 단위 테스트 작성 (tests/roles.test.ts 등)

### Week 3: Phase 2 UI/UX (Dashboard)
- [ ] Day 1-2: TeamEnergyDial 컴포넌트
- [ ] Day 3: CompatibilityGraph 스타일 개선
- [ ] Day 4-5: RoleCard 컴포넌트
- [ ] Day 6-7: InsightCards 컴포넌트
- [ ] Day 8: ResultPanel 레이아웃 재구성

### Week 4: Phase 3 데이터/API (선택)
- [ ] Day 1-2: Prisma 스키마 확장 + migration
- [ ] Day 3-4: API 라우트 구현
- [ ] Day 5: 캐싱 로직
- [ ] Day 6-7: 통합 테스트

---

## 🔍 기술 스택 및 의존성

### 추가 필요 라이브러리
```json
{
  "react-gauge-chart": "^0.5.0",  // 게이지 차트
  "framer-motion": "^11.0.0",     // 애니메이션 (선택)
  "lucide-react": "^0.300.0"      // 아이콘 (이미 있을 수도)
}
```

### 기존 활용
- recharts: 게이지/레이더/도넛 차트
- d3-force: 네트워크 레이아웃
- Tailwind: 스타일링

---

## 💡 주요 설계 원칙

### 1. 투명성 (Explainability)
- 모든 점수에 breakdown 제공
- 사용자가 "왜 이 점수인지" 이해 가능하도록

### 2. 점진적 개선 (Incremental)
- 기존 코드 최대한 재사용
- 새 기능은 별도 파일로 분리 (lib/roles.ts, lib/insights.ts)
- 기존 API 깨지지 않도록 하위 호환성 유지

### 3. 성능
- 계산 무거운 부분은 서버 사이드에서만
- 인사이트는 팀 생성 시 1회 계산 후 캐싱
- 재계산은 명시적 요청 시만

### 4. 확장성
- 역할 타입/인사이트 카테고리는 enum으로 관리
- 새로운 규칙 추가 시 config 파일만 수정

---

## 🎨 UI/UX 와이어프레임 (간략)

```
┌─────────────────────────────────────────────┐
│  팀 이름: "어벤져스"                         │
│  목적: 프로젝트 팀                            │
├─────────────────────────────────────────────┤
│  [팀 에너지 다이얼]                          │
│   조화 ████████░░ 72                        │
│   갈등 ███░░░░░░░ 38                        │
│   협업 ████████░░ 84                        │
├─────────────────────────────────────────────┤
│  [팀 오행 분포]   [관계 네트워크]            │
│   🌳목 20%         🔵A ━━ 🔵B               │
│   🔥화 28%         ┃     ╱                  │
│   🏔토 18%         🔵C ━━ 🔵D               │
│   ⚒금 22%                                   │
│   💧수 12%                                   │
├─────────────────────────────────────────────┤
│  [팀원 역할 카드]                            │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │ A  │ │ B  │ │ C  │                      │
│  │리더│ │기획│ │분석│                       │
│  └────┘ └────┘ └────┘                      │
├─────────────────────────────────────────────┤
│  [인사이트]                                  │
│  🔴 A와 B는 상극 관계, C가 중재 권장         │
│  🟡 팀 전체 토 부족, 조율 프로세스 필요       │
│  🔵 화 기운 강함, 빠른 실행력 기대 가능       │
└─────────────────────────────────────────────┘
```

---

## 📋 체크리스트

### Phase 1 (알고리즘)
- [ ] lib/roles.ts 구현
- [ ] lib/compat.ts 강화 (천간합충, 지지삼합)
- [ ] lib/insights.ts 구현
- [ ] reportService.ts 통합
- [ ] 단위 테스트

### Phase 2 (UI/UX)
- [ ] TeamEnergyDial 컴포넌트
- [ ] CompatibilityGraph 개선
- [ ] RoleCard 컴포넌트
- [ ] InsightCards 컴포넌트
- [ ] ResultPanel 재구성

### Phase 3 (데이터/API)
- [ ] Prisma 스키마 확장
- [ ] API 라우트
- [ ] 캐싱 로직

---

## 🚀 시작하기

**추천 순서**:
1. **lib/roles.ts** 먼저 구현 → 역할 시스템 기초
2. **lib/insights.ts** 구현 → 인사이트 생성 로직
3. **lib/compat.ts** 개선 → 궁합 점수 고도화
4. UI 컴포넌트들 순차 개발
5. 통합 테스트 및 피드백

**다음 단계**: 어느 파트부터 시작할까요?
- A) lib/roles.ts (역할 프로파일링)
- B) lib/compat.ts (궁합 알고리즘 강화)
- C) lib/insights.ts (인사이트 생성)
- D) UI 컴포넌트부터
