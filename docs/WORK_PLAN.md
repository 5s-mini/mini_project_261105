# 맛집 관리 프로그램 (3조) — 4인 작업 분배

> 기준: 기획서(1일차 UI 스케치, JSON 형식, Main/Detail view 정의)와 2026-11-05 시점 저장소 상태
> 일정: 11/5(목)·11/6(금) 개발 → 11/9(월) 합치기 → 11/10(화) 최종 테스트·발표

---

## 0. 한눈에 보기

| 항목 | 결정 |
| --- | --- |
| 레이아웃 | **FCL** (스케치에서 채택) — 왼쪽 열 = 메인 목록(`DynamicPage`), 오른쪽 열 = 상세(`ObjectPageLayout`) |
| 구현 순서 (스케치 기준) | ① 메인 + 필터링/정렬 → ② 상세 + Dialog(이미지) → ③ 기타: 추가·삭제(시연용), 오늘의 메뉴 뽑기 |
| 팀 구성 (최대 2인 1조) | **1조 = A + B** (메인 목록), **2조 = C + D** (상세 + 데이터 변경) |
| 보류 | 지도(스케치에서 X 표시, 데이터에 위치 필드 없음), 날짜 컬럼(기획서에서 "일단 생략") |

### 필수 조건 충족 매핑

| 필수 조건 | 충족 위치 | 담당 |
| --- | --- | --- |
| `sap.m.Image` 사용 | 메인 테이블 썸네일, 상세 헤더 이미지, 이미지 확대 Dialog, 뽑기 Dialog | A, C, D |
| 상세 페이지 사용 | `Detail.view.xml` | C |
| objectPage / DynamicPage / FCL / SplitApp 중 1개 이상 | FCL(App) + DynamicPage(Main) + ObjectPage(Detail) — 3개 모두 사용 | A, C |

---

## 1. 현재 저장소 상태 (작업 전 확인)

**되어 있는 것**
- SAP Fiori Basic 템플릿 (UI5 1.154, `sap_horizon`)
- `webapp/model/data.json` — 20건 (한식·중식·양식·일식 각 5건), 형식은 기획서와 동일

**아직 없는 것 / 문제점**
- `data.json`이 모델로 등록되어 있지 않음 (`manifest.json`의 models에 i18n만 있음)
- `App.view.xml`이 `sap.m.App`, 라우트는 `RouteMain` 1개뿐
- `Main.view.xml`은 빈 `Page`, `Detail.view.xml`·`Detail.controller.js`는 **0바이트 빈 파일**
- 데이터 이슈
  - 중식 5건의 `image`가 `https://picsum.photos/200` — 새로고침할 때마다 다른 랜덤 사진이 나옴
  - 나머지 이미지도 외부 링크(notion, gstatic, pstatic, cloudfront) — 발표 당일 링크가 막히면 안 뜰 수 있음
  - 이름 중복 (짜장면 2건, 마라탕 2건) → 상세 이동용 고유 `id` 필요

---

## 2. 역할과 파일 소유권

**소유 파일은 그 사람만 수정합니다.** 다른 사람 파일을 고쳐야 하면 소유자에게 요청하세요. 충돌을 막는 가장 확실한 방법입니다.

| 담당 | 역할 | 소유 파일 |
| --- | --- | --- |
| **A** (조장 권장) | 공통 기반(FCL·라우팅·모델) + 메인 테이블 + 머지 담당 | `manifest.json`, `Component.js`, `App.view.xml`, `App.controller.js`, `Main.view.xml`, `model/formatter.js`, `test/**` |
| **B** | 메인 검색·필터·정렬 + 발표자료 | `Main.controller.js`의 **[B] 영역** |
| **C** | 상세 페이지(ObjectPage) + 이미지 확대 Dialog | `Detail.view.xml`, `Detail.controller.js`, `view/fragments/ImageDialog.fragment.xml` |
| **D** | 데이터 정비 + 추가·삭제 + 오늘의 메뉴 뽑기 + 시연 시나리오 | `model/data.json`, `webapp/images/**`, `view/fragments/AddDialog.fragment.xml`, `view/fragments/RandomDialog.fragment.xml`, `Main.controller.js`의 **[D] 영역** |
| 공용 | 영역(섹션)을 나눠서 각자 자기 영역만 수정 | `i18n/i18n.properties`, `css/style.css`, `Main.controller.js` |

---

## 3. 공통 약속 (Day 1에 확정, 바꾸려면 4명 합의)

| 항목 | 값 |
| --- | --- |
| 데이터 모델 | 이름 없는 기본 JSONModel → 뷰에서 `{/food}`로 바인딩 |
| 고유 키 | `data.json` 각 항목에 `"id": 1` ~ `20` (숫자). 새로 추가할 때는 최댓값 + 1 |
| 라우트 | `RouteMain` = `""`, `RouteDetail` = `detail/{id}` |
| 레이아웃 모델 | `appView` 모델의 `/layout` (`OneColumn` / `TwoColumnsMidExpanded` / `MidColumnFullScreen`) |
| 뷰 ID | FCL `id="app"`, Main DynamicPage `id="page"`, Detail ObjectPage `id="detailPage"` — 기존 OPA 테스트가 `app`, `page`를 찾으므로 **유지** |
| 종류 값 | `한식`, `중식`, `양식`, `일식` (현재 데이터 기준) |

### Main.view.xml 컨트롤 계약 (A가 Day 1에 마크업까지 미리 작성, B·D는 핸들러만 구현)

| 컨트롤 | id | 이벤트 → 핸들러 | 구현 |
| --- | --- | --- | --- |
| `Title` | `tableTitle` | Table `updateFinished` → `.onUpdateFinished` | B |
| `SearchField` | `searchField` | `liveChange` → `.onSearch` | B |
| `MultiComboBox` (종류) | `typeFilter` | `selectionFinish` → `.onTypeFilterChange` | B |
| `Button` (정렬) | `sortButton` | `press` → `.onSortPress` | B |
| `Button` (오늘의 메뉴 뽑기) | `randomButton` | `press` → `.onRandomPick` | D |
| `Button` (추가) | `addButton` | `press` → `.onOpenAddDialog` | D |
| `Table` | `foodTable` | `itemPress` → `.onItemPress` / `delete` → `.onDelete` (`mode="Delete"`) | A / D |

- Table의 `noDataText="{i18n>noData}"` 속성도 A가 stub에 미리 넣어 둡니다 (문구는 B가 i18n [B] 영역에 작성).

### Main.controller.js 영역 나누기 (A가 Day 1에 stub으로 커밋)

`sap.ui.define`의 import 목록은 **B·D가 쓸 것까지 A가 미리 전부 넣습니다.** 맨 위 import 줄을 여러 명이 고치면 거의 확실히 충돌납니다.

```js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "project261105/model/formatter"
], (Controller, Filter, FilterOperator, Sorter, JSONModel, Fragment, MessageBox, MessageToast, formatter) => {
    "use strict";

    return Controller.extend("project261105.controller.Main", {
        formatter: formatter,

        onInit() {
        },

        /* ===== [A] 목록 · 네비게이션 ===== */
        onItemPress(oEvent) {
        },
        /* ===== [A] end ===== */

        /* ===== [B] 검색 · 필터 · 정렬 ===== */
        onUpdateFinished(oEvent) {
        },
        onSearch(oEvent) {
        },
        onTypeFilterChange(oEvent) {
        },
        onSortPress() {
        },
        _applyFilters() {
        },
        /* ===== [B] end ===== */

        /* ===== [D] 추가 · 삭제 · 뽑기 ===== */
        onOpenAddDialog() {
        },
        onSaveAdd() {
        },
        onCancelAdd() {
        },
        onDelete(oEvent) {
        },
        onRandomPick() {
        }
        /* ===== [D] end ===== */
    });
});
```

- 각자 **자기 영역 안에서만** 함수 본문을 채우거나 새 함수를 추가합니다.
- 새 함수를 추가할 때 앞 함수 뒤에 쉼표(`,`)를 붙이는 것을 잊지 마세요.

### i18n.properties 영역 나누기 (A가 Day 1에 커밋)

```properties
# ===== [A] Main =====
# ===== [A] end =====

# ===== [B] Toolbar =====
# ===== [B] end =====

# ===== [C] Detail =====
# ===== [C] end =====

# ===== [D] Dialog =====
# ===== [D] end =====
```

---

## 4. 작업 목록 (최소 단위)

우선순위: **P1** = 필수/스케치 ①, **P2** = 스케치 ②, **P3** = 기타(시간 남으면)

### A — 공통 기반 + 메인 테이블 (1조)

| ID | 작업 | 파일 | 완료 조건 | 선행 | 우선 | 예상 |
| --- | --- | --- | --- | --- | --- | --- |
| A-1 | `data.json`을 기본 모델로 등록 (`sap.app.dataSources` + `sap.ui5.models[""]`) | manifest.json | 뷰에서 `{/food}` 바인딩 시 20건 조회 | — | P1 | 0.5h |
| A-2 | 라이브러리 추가: `sap.f`, `sap.uxap` | manifest.json | 앱 실행 시 라이브러리 로드 에러 없음 | — | P1 | 0.2h |
| A-3 | 라우팅 변경: `routerClass: sap.f.routing.Router`, `TargetMain`→`beginColumnPages`, `TargetDetail`→`midColumnPages`, `RouteDetail` 추가 | manifest.json | URL `#/detail/1` 진입 시 에러 없음 | A-2 | P1 | 1h |
| A-4 | `App.view.xml`: `sap.m.App` → `f:FlexibleColumnLayout id="app" layout="{appView>/layout}"` | App.view.xml | 메인이 왼쪽 열에 표시 | A-3 | P1 | 0.5h |
| A-5 | `appView` 모델 생성 + 라우트별 레이아웃 전환 (Main→`OneColumn`, Detail→`TwoColumnsMidExpanded`) | Component.js, App.controller.js | 상세 진입 시 2열로 바뀜 | A-4 | P1 | 1h |
| A-6 | **Stub 커밋**: Main.view 마크업(3장 계약표 전부), Main.controller 영역 stub, Detail.view/controller 최소 골격(빈 ObjectPage), `formatter.js` 빈 함수, i18n 영역 → **main에 머지 후 전원에게 pull 공지** | 여러 파일 | 4명 모두 pull 후 앱이 에러 없이 뜸 | A-1~5 | P1 | 1h |
| A-7 | 메인 테이블 컬럼 6개: 이미지 / 메뉴 / 가게명 / 종류 / 별점 / 재방문 의사 | Main.view.xml | 20건이 6개 컬럼으로 표시 | A-6 | P1 | 1h |
| A-8 | 이미지 컬럼에 `sap.m.Image` (고정 크기 썸네일) | Main.view.xml, style.css [A] | 썸네일 크기가 일정함 | A-7 | P1 | 0.5h |
| A-9 | 별점 `RatingIndicator displayOnly="true" maxValue="5"`, 재방문 `ObjectStatus` | Main.view.xml | 별 아이콘 + 있어요/없어요 색상 표시 | A-10 | P1 | 0.5h |
| A-10 | `formatter.js`: `visitText`(true→"있어요"), `visitState`(Success/Error), `priceText`(12000→"12,000원") | model/formatter.js | 메인·상세에서 공통 사용 | A-6 | P1 | 0.5h |
| A-11 | `onItemPress`: 클릭한 행의 `id`로 `navTo("RouteDetail", { id })` | Main.controller.js [A] | 행 클릭 시 오른쪽에 상세 열림 | A-3, D-1 | P1 | 0.5h |
| A-12 | OPA 테스트가 새 구조에서도 통과하는지 확인·수정 | test/integration/** | `npm run int-test` 통과 | A-6 | P2 | 0.5h |
| A-13 | 11/9 머지 진행, `npm run lint` 에러 정리 | — | main에서 전 기능 동작 | 전원 | P1 | — |

### B — 검색 · 필터 · 정렬 (1조)

| ID | 작업 | 파일 | 완료 조건 | 선행 | 우선 | 예상 |
| --- | --- | --- | --- | --- | --- | --- |
| B-1 | `_applyFilters()`: 검색·종류 조건을 AND로 묶어 `binding.filter()`를 **한 곳에서만** 호출 | Main.controller.js [B] | 다른 핸들러는 상태만 바꾸고 이 함수를 호출 | A-6 | P1 | 1h |
| B-2 | `onSearch`: 메뉴명 **또는** 가게명 `Contains` | Main.controller.js [B] | "구로" 입력 시 해당 가게만 표시 | B-1 | P1 | 0.5h |
| B-3 | `onTypeFilterChange`: 종류 다중 선택 → `type EQ` 조건을 OR로 묶기 | Main.controller.js [B] | 한식+중식 선택 시 10건 | B-1 | P1 | 1h |
| B-4 | 검색 + 종류 조합 확인 | — | "한식+중식" + "구로" 동시에 동작 | B-2, B-3 | P1 | 0.5h |
| B-5 | `onSortPress`: 별점 높은순 ↔ 낮은순 토글 (`Sorter("star", bDesc)`), 버튼 아이콘·툴팁 변경 | Main.controller.js [B] | 누를 때마다 순서 반전 | A-6 | P1 | 1h |
| B-6 | `onUpdateFinished`: 제목을 "맛집 목록 (n)"으로 갱신 | Main.controller.js [B] | 필터 후 건수가 맞게 바뀜 | A-6 | P1 | 0.5h |
| B-7 | 결과 0건일 때 `noDataText` 문구 | i18n [B] | "조건에 맞는 맛집이 없어요" 표시 | A-7 | P2 | 0.2h |
| B-8 | 정렬 기준 추가 (이름순 / 가게명순) | Main.controller.js [B] | 기준 선택 후 정렬 동작 | B-5 | P3 | 1h |
| B-9 | 재방문 의사 필터 (전체 / 있어요 / 없어요) — 컨트롤 추가는 A에게 요청 | Main.controller.js [B] | B-1 조건에 합쳐져 동작 | B-1 | P3 | 0.5h |
| B-10 | 발표자료 작성 (기능 소개, 필수 조건 충족 화면 캡처) | — | 11/9 저녁까지 초안 | — | P1 | 2h |

### C — 상세 페이지 (2조)

| ID | 작업 | 파일 | 완료 조건 | 선행 | 우선 | 예상 |
| --- | --- | --- | --- | --- | --- | --- |
| C-1 | `uxap:ObjectPageLayout id="detailPage"` 골격 (A-6 stub을 이어받음) | Detail.view.xml | 상세 열에 빈 ObjectPage 표시 | A-6 | P1 | 0.5h |
| C-2 | `RouteDetail` `patternMatched` → `id`로 배열 위치를 찾아 `bindElement("/food/" + i)` (`oModel.dataLoaded()` 이후 실행) | Detail.controller.js | `#/detail/3`이 3번 맛집을 표시 | C-1, D-1 | P1 | 1h |
| C-3 | 헤더: 제목 = 메뉴명, 부제 = 가게명, `sap.m.Image`(크게), 종류 `ObjectStatus`, 별점 `RatingIndicator`, 재방문 (A-10 formatter 재사용) | Detail.view.xml | 기획서 Detail 이미지 상단과 같은 정보 표시 | C-2 | P1 | 1h |
| C-4 | 섹션 "먹은 메뉴 · 가격": `items="{detail}"` 테이블 (메뉴, `priceText`) | Detail.view.xml | "팟타이 / 12,000원" 형식 | C-2 | P1 | 1h |
| C-5 | 섹션 "후기": `detail` 배열의 `review` 표시 (여러 건 대비 List) | Detail.view.xml | 긴 후기가 줄바꿈되어 전부 보임 | C-2 | P1 | 0.5h |
| C-6 | 닫기 버튼 → `navTo("RouteMain")` / 전체화면 토글 → `appView>/layout` 변경 | Detail.view.xml, Detail.controller.js | 닫으면 1열, 전체화면 ↔ 2열 전환 | A-5 | P1 | 1h |
| C-7 | 이미지 클릭 → 확대 Dialog (`Fragment.load`는 한 번만, 이후 재사용) | ImageDialog.fragment.xml, Detail.controller.js | 이미지 크게 보기 + 닫기 | C-3 | P2 | 1h |
| C-8 | 없는 `id`(삭제된 항목, URL 직접 입력) → 메인으로 이동 + MessageToast | Detail.controller.js | `#/detail/999` 입력 시 메인으로 돌아감 | C-2 | P2 | 0.5h |
| C-9 | 다른 행 클릭 시 상세가 바로 바뀌는지, 스크롤이 맨 위로 가는지 확인 | — | 연속 클릭에도 정보가 섞이지 않음 | C-2 | P2 | 0.3h |

### D — 데이터 + 추가·삭제·뽑기 (2조)

| ID | 작업 | 파일 | 완료 조건 | 선행 | 우선 | 예상 |
| --- | --- | --- | --- | --- | --- | --- |
| D-1 | **(Day 1 선행)** 각 항목에 `"id": 1` ~ `20` 추가 → main에 바로 머지 | data.json | 20건 모두 고유 id | — | P1 | 0.3h |
| D-2 | 중식 5건 `picsum` 랜덤 이미지를 실제 음식 사진으로 교체 | data.json | 새로고침해도 같은 사진 | D-1 | P1 | 0.5h |
| D-3 | 이미지를 `webapp/images/`에 저장하고 `"images/xxx.jpg"` 상대경로로 변경 (기획서 샘플 형식과 동일) | data.json, images/** | 외부 인터넷이 막혀도 이미지 표시 | D-2 | P2 | 1h |
| D-4 | 추가 Dialog: 메뉴명·가게명 `Input`, 종류 `Select`, 별점 `RatingIndicator`(편집 가능), 재방문 `Switch`, 이미지 URL, 먹은 메뉴·가격·후기 | AddDialog.fragment.xml | 모든 입력란 표시 | A-6 | P3 | 1.5h |
| D-5 | `onOpenAddDialog`: Fragment 1회 로드 + 입력용 임시 모델(`newFood`) 초기화 | Main.controller.js [D] | 다시 열면 빈 값으로 초기화됨 | D-4 | P3 | 0.5h |
| D-6 | `onSaveAdd`: 필수값(메뉴명·가게명·종류) 검사 → `ValueState.Error` / id = 최댓값+1 / `/food`에 추가 / MessageToast | Main.controller.js [D] | 추가 후 목록·건수에 바로 반영, 상세도 열림 | D-5, D-1 | P3 | 1.5h |
| D-7 | `onDelete`: `MessageBox.confirm` → 배열에서 제거 → 삭제한 항목의 상세가 열려 있었다면 `RouteMain`으로 이동 | Main.controller.js [D] | 삭제 후 목록·건수 반영, 빈 상세가 남지 않음 | A-7, C-2 | P3 | 1h |
| D-8 | `onRandomPick`: **현재 필터 결과** 중 1건 랜덤 → Dialog(이미지·메뉴·가게) + "상세 보기" 버튼 → `navTo("RouteDetail")` | RandomDialog.fragment.xml, Main.controller.js [D] | 한식만 필터 시 한식 중에서만 뽑힘 | A-7, B-1 | P3 | 1h |
| D-9 | 시연 시나리오 작성 (검색 → 필터 → 상세 → 추가 → 삭제 → 뽑기 순서, 입력할 예시 데이터 준비) | — | 11/9 저녁까지 | — | P1 | 1h |

> 참고: 추가·삭제는 메모리 상의 JSON 모델만 바꾸기 때문에 **새로고침하면 원래 20건으로 돌아갑니다.** 기획서의 "(시연)"용 기능이므로 발표 때 이 점을 미리 말해 두면 됩니다.

### 작업량 점검

| 담당 | P1 | P2 | P3 | 합계(대략) |
| --- | --- | --- | --- | --- |
| A | 7.2h | 0.5h | — | 7.7h + 머지 |
| B | 6.5h (발표자료 포함) | 0.2h | 1.5h | 8.2h |
| C | 5h | 1.8h | — | 6.8h |
| D | 1.8h (시연 시나리오 포함) | 1h | 5.5h | 8.3h |

D는 P3 비중이 크므로, Day 2에 P1·P2를 끝낸 사람이 D의 P3 작업(예: D-8 뽑기)을 나눠 가져갑니다.

---

## 5. 일정

| 날짜 | A | B | C | D |
| --- | --- | --- | --- | --- |
| **11/5(목) Day 1** | A-1 ~ A-6 → **main 머지 + pull 공지** | 브랜치 생성, Filter/Sorter API 학습 | 브랜치 생성, ObjectPage 예제 학습 | **D-1 먼저 머지**, D-2 |
| **11/6(금) Day 2** | A-7 ~ A-11 | B-1 ~ B-7 | C-1 ~ C-8 | D-3 ~ D-7 |
| 11/7~8 주말 | (선택) 밀린 작업 보충 | | | |
| **11/9(월) Day 3 오전** | 머지 순서 **A → B → C → D**, 하나 머지할 때마다 실행 확인 | | | |
| **11/9(월) Day 3 오후** | A-12, 통합 테스트(6장) | B-8~B-9(P3), **B-10 발표자료** | C-9, 버그 수정 | D-8, **D-9 시연 시나리오** |
| **11/10(화)** | 최종 테스트 → 발표 | | | |

**Day 1 핵심 경로:** `A-1 → A-2 → A-3 → A-4 → A-5 → A-6` 과 `D-1` 이 main에 들어가야 Day 2에 4명이 동시에 작업할 수 있습니다.

---

## 6. Git 규칙

1. 작업 시작 전 항상 `git pull origin main`
2. 브랜치: `feature/<담당>-<작업>` — 예) `feature/B-filter`, `feature/C-detail`, `feature/D-add-dialog`
3. 커밋 메시지: 기존 규칙 유지 — `feat:`(기능), `fix:`(버그), `refactor:`(정리), `docs:`(문서), 작업 ID 함께 표기
   - 예) `feat: B-3 종류 다중 필터 추가`
4. PR은 작게: 작업 2~3개 단위로 올리고, **같은 조 짝꿍이 리뷰** → A가 머지
5. 소유하지 않은 파일은 수정하지 않기 (2장 표). 꼭 필요하면 소유자에게 요청
6. PR 올리기 전에 `npm run lint` 실행

---

## 7. 통합 테스트 체크리스트 (11/9 오후)

- [ ] 첫 화면에 20건 + 썸네일 이미지 표시 (`sap.m.Image`)
- [ ] 제목의 건수가 필터 결과와 일치
- [ ] "구로" 검색 → 가게명에 "구로"가 들어간 맛집만 표시
- [ ] 종류 다중 선택 (한식 + 중식 → 10건)
- [ ] 검색 + 종류 필터 동시 적용
- [ ] 별점 정렬 토글
- [ ] 행 클릭 → 오른쪽 상세 열림 (FCL 2열)
- [ ] 상세: 메뉴·가게·종류·별점·재방문·이미지 / 먹은 메뉴·가격 / 후기 표시
- [ ] 상세 이미지 클릭 → 확대 Dialog
- [ ] 상세 닫기 / 전체화면 토글
- [ ] 다른 행을 연속으로 클릭해도 상세 정보가 섞이지 않음
- [ ] `#/detail/999` 직접 입력 → 메인으로 돌아감
- [ ] 추가 → 목록에 반영 → 클릭 시 상세 정상
- [ ] 필수값 비우고 저장 → 에러 표시
- [ ] 열려 있는 상세의 항목 삭제 → 상세 닫힘
- [ ] 오늘의 메뉴 뽑기 → 필터 결과 안에서만 뽑힘 → 상세 보기 이동
- [ ] 인터넷 없이(또는 외부 이미지 차단 상태) 이미지 표시 확인
- [ ] `npm run lint` 에러 0
- [ ] `npm run int-test` 통과

---

## 8. 보류 항목 (시간 남으면)

| 항목 | 보류 이유 | 하려면 필요한 것 |
| --- | --- | --- |
| 지도 표시 (네이버 지도 등) | 스케치에서 X 표시, 데이터에 위치 필드 없음 | `data.json`에 주소/좌표 추가, 지도 API 키 |
| 날짜 컬럼 | 기획서에 "일단 생략" | `data.json`에 `date` 추가, 날짜 정렬 |
| 추가·삭제 결과 유지 | 시연용이라 새로고침 시 초기화돼도 됨 | localStorage 저장/불러오기 |
| 메뉴 후기 추가 (한 가게에 여러 메뉴) | `detail`이 배열이라 구조상 가능하지만 범위 밖 | 상세에 "메뉴 추가" Dialog |
