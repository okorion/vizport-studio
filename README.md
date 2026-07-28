# VizPort Studio

데이터를 넣으면 적합한 그래프를 추천하고, 실제 데이터로 미리 본 뒤 React 코드·LLM 프롬프트·VizSpec으로 가져갈 수 있는 로컬 우선 시각화 스튜디오입니다.

## 현재 지원 범위

- CSV, TSV, JSON 입력과 브라우저 내 데이터 프로파일링
- 규칙 기반 막대, 선, 영역, 산점도, 파이, 히스토그램 추천
- Apache ECharts Canvas 미리보기
- React + TypeScript 코드, 구현 프롬프트, VizSpec 내보내기
- IndexedDB 프로젝트 저장
- Ollama/LM Studio의 OpenAI 호환 API 또는 브라우저 WebLLM을 이용한 선택적 추천 보정

원본 데이터와 프로젝트는 기본적으로 브라우저 밖으로 전송되지 않습니다. AI 보정에는 원본 행 대신 필드 종류와 추천 후보 요약만 사용합니다.

## 시작하기

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

검증 명령은 다음과 같습니다.

```bash
npm run lint
npm run typecheck
npm test
```

## 가장 자주 수정할 위치

| 변경 목적 | 수정 위치 |
| --- | --- |
| 그래프 종류 추가·삭제 | `src/core/charts/definitions/`와 `src/core/charts/catalog.ts` |
| 추천 점수·조건 변경 | 해당 `definitions/*.ts` |
| VizSpec 필드 변경 | `src/core/viz-spec/schema.ts`부터 변경 후 렌더러·내보내기 반영 |
| CSV/JSON 이외 입력 추가 | `src/integrations/data-readers/` |
| 미리보기 라이브러리 교체 | `src/integrations/renderers/`와 `ChartPreview.tsx` |
| 내보내기 형식 추가 | `src/integrations/exporters/`와 `OutputPanel.tsx` |
| LLM 공급자 추가 | `src/integrations/llm/`와 `AiRefinePanel.tsx` |
| 화면 구성 변경 | `src/features/studio/` |

전체 의존 방향과 변경 절차는 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 기술 선택

- React 19 + TypeScript + vinext
- Zustand: 작은 클라이언트 작업 상태
- Zod: 이식 가능한 VizSpec과 AI 구조화 출력 검증
- Apache ECharts: 안정적인 Canvas 렌더링과 폭넓은 차트 지원
- Papa Parse, d3-array: 검증된 데이터 파싱·통계 기능
- Dexie: IndexedDB 저장소의 얇은 래퍼
- Vercel AI SDK, OpenAI Compatible provider, WebLLM: 로컬 우선이면서 API 확장이 가능한 AI 경계

WebGPU는 두 경로에서 확장할 수 있습니다. 브라우저 LLM은 WebLLM을 통해 바로 사용하며, 대규모 시각화는 VizSpec의 `renderer.preferred`를 기준으로 별도 WebGPU 렌더러를 추가할 수 있습니다. 현재 일반 차트 미리보기는 호환성이 높은 ECharts Canvas를 기본값으로 사용합니다.
