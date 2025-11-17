# 개발 플랜 — 우리팀 사주 오행 궁합 (Next.js + Prisma)

## 1. 목표 범위 (Phase 0 — POC)
- Next.js(App Router) 서버 컴포넌트와 Route Handler로 팀/멤버 입력과 분석 API를 제공한다.
- Prisma + PostgreSQL 모델을 정의하고, 분석 요청 시 Prisma Client mock 계층을 통해 데이터를 주입/조회한다.
- 클라이언트 페이지에서 팀 메타 입력, 멤버 폼, 기본 차트 영역(placeholder)을 구성한다.
- 사주/오행 계산은 `lib/elements` 유틸로 구현해 서버/클라이언트에서 공유한다.
- API 응답을 기반으로 개인 카드(오행 분포)와 팀 점수 요약을 렌더링하는 UI를 만든다.

## 2. 시스템 구성요소
1. **`app/api/reports/team/route.ts`** — POST 요청으로 팀/멤버 정보를 받아 오행 계산 후 JSON 반환
2. **`lib/elements.ts`** — 천간·지지 enum, 오행 매핑, 분포/점수 계산 유틸
3. **`prisma/schema.prisma`** — spec의 테이블 구조를 Prisma 모델로 정의
4. **React Components** — 팀 생성 폼, 멤버 리스트 편집, 결과 카드/차트 placeholder
5. **`tests/elements.test.ts`** — Vitest 기반 규칙 검증
6. **`docker-compose.yml` + `.env`** — Postgres 컨테이너와 환경변수 템플릿

## 3. 우선순위 백로그
| 순번 | 기능 | 설명 |
| --- | --- | --- |
| P0 | Elements 유틸 | 오행 매핑, 분포 계산, 상생/상극 지수 산출 |
| P0 | Next Route Handler | `/api/reports/team` POST, 입력 검증 및 유틸 호출 |
| P0 | 기본 UI | 팀 정보/멤버 입력 + 응답 결과 표시 |
| P0 | Docker Compose / Postgres | 로컬 Postgres 컨테이너 기동 및 `DATABASE_URL` 주입 |
| P1 | Prisma 실제 DB 연결 | PostgreSQL 연결, CRUD 구현 |
| P1 | 차트 시각화 | Recharts + d3-force 그래프 렌더링 |
| P2 | Magic link/Auth | 토큰 기반 접근 제어 |
| P2 | PDF Export | Playwright 기반 서버 사이드 렌더 |

## 4. 작업 분해 (이번 스프린트)
1. 프로젝트 초기화 (Next.js config, TypeScript, Tailwind)
2. `lib/elements.ts` 및 관련 타입 작성
3. Route Handler → 유틸 호출 + 응답 포맷 정의
4. 폼 컴포넌트와 상태 관리 (client component) 구성
5. Vitest 설정과 유틸 테스트 작성
6. Docker Compose로 Postgres 기동 스크립트와 `.env` 템플릿 준비

## 5. 리스크 & 대응
- **명리 규칙 정확도**: 상수/테이블로 명시하고 테스트 케이스 유지
- **클라이언트/서버 공유 로직**: tree-shaking을 고려해 순수 함수만 export
- **DB 미구현 상태**: Prisma mock 데이터로 API를 먼저 완성한 뒤 실제 연결 계획 수립

## 6. 다음 단계
1. Prisma Client 설정 및 seed 스크립트 준비
2. 시각화 라이브러리(Recharts, d3-force) 적용
3. Magic link 인증 흐름과 감사 로그 엔드포인트 구현
4. Docker Compose를 CI나 스테이징 환경과 연동해 일관된 DB 부트스트랩 제공
