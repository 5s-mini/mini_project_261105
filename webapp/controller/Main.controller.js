sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/library",
    "project261105/model/formatter"
], (Controller, Filter, FilterOperator, Sorter, JSONModel, Fragment, MessageBox, MessageToast, mobileLibrary, formatter) => {
    "use strict";

    return Controller.extend("project261105.controller.Main", {
        formatter: formatter,

        onInit() {
            // Main Model manifest.json 내 등록 (data.json)

            // 종류 선택 목록용 임시 모델 (처음엔 빈 목록)
            this.getView().setModel(new JSONModel({ types: [] }), "typeList");
        },
        onListItemPress(oEvent) {
            // 리스트 누르면 Detail Page로 파라미터 넘겨주며 화면 전환 (routing)

            // 1. 선택한 행의 경로 가져오기
            const sPath = oEvent.getParameter("listItem").getBindingContext().getPath(); // "/food/3"

            // 2. (파라미터용) 행 번호만 가져오기
            const sFoodId = sPath.split("/").pop();

            // 3. 파라미터와 함께 Datail Page로 전환 
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                paramId: sFoodId
            });
        },
        onHeaderPress : function(sField) {
            //  별점 및 재방문 의사에 sort 적용
            if (this._sSortField === sField) {
                // 같은 열을 다시 누르면 오름차순, 내림차순 전환
                this._bDesc = !this._bDesc;
            } else {
                // 다른 열을 누르면 지금까지의 1순위를 2순위로 내려서 보관
                this._sPrevField = this._sSortField;
                this._bPrevDesc = this._bDesc;

                // 방금 누른 열을 1순위로 내림차순 정렬
                this._sSortField = sField;
                this._bDesc = true;
            }

            // 1순위 정렬 기준
            let aSorters = [new Sorter(this._sSortField, this._bDesc)];

            // 2순위가 있으면 뒤에 추가 (1순위가 같은 행끼리는 2순위로 비교)
            if (this._sPrevField) {
                aSorters.push(new Sorter(this._sPrevField, this._bPrevDesc));
            }

            this.byId("productsTable").getBinding("items").sort(aSorters);
        },
        onFilter : function (oEvent) {
            // Popover내 적용할 필터 종류 만들기

            let oButton = oEvent.getSource();    // 누른 필터 버튼 (popover 호출용)

            // 1. Filter 종류 목록 만들기
            let aFood = this.getView().getModel().getProperty("/food"); // data 전부
            let aNames = [];                                    // 글자만 모으는 빈배열

            // 1-1) 값이 비어있지 않고 아직 배열 내 없으면 빈배열에 추가
            for (let i = 0; i < aFood.length; i++) {
                let sType = aFood[i].type.trim();     // 객체별 type 순환
                if (sType !== "" && !aNames.includes(sType)) {  
                    aNames.push(sType);
                }           // ** includes 배열에 값있으면 true 없으면 false
            }

            // 1-2) Model 추가용 배열 만들기
            let aTypes = [{ key: "", text: "전체" }];    // Filter용 목록 (첫 항목 필터 미적용 전체)
            for (let i = 0; i < aNames.length; i++) {
                aTypes.push({ key: aNames[i], text: aNames[i] });
            }
            this.getView().getModel("typeList").setProperty("/types", aTypes);
            // 만들어진 배열 이전 만든 빈 모델에 넣기

            // 2. Popover 열기 (Dialog와 동일한 방법)
            if (!this._pPopover) {
                this._pPopover = this.loadFragment({
                    name: "project261105.view.fragment.Filter"
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });  // open이 아니라 어떤 컨트롤에 붙어서 나오는 것이기 때문에 openby 사용 
        },
        onTypeSelect : function (oEvent) {
            // Popover에서 종류를 누르면 table에 적용하기

            // 1. Select에서 고른 종류의 key ("" = 전체, "한식" 등)
            let sKey = oEvent.getSource().getSelectedKey();

            // 2. 고른 종류를 기억해 두기
            this._sType = sKey;

            // 3. 검색어와 종류를 함께 적용
            this._applyFilters();

            // 4. Popover 닫기
            this.byId("Filter").close();
        },
        onSearch: function (oEvent) {
            // 1. 검색어를 기억해 두기
            this._sQuery = oEvent.getParameter("query");
            
            // 2. 검색어와 종류를 함께 적용
            this._applyFilters();
        },
        _applyFilters: function (oEvent) {
            // filter 배열 설정, data.json의 name(메뉴명) 속성값이 sQuery와 일치 여부를 검사하는 oFilter 선언
            let aFilters = [];
            let sQuery = this._sQuery;
            let sType = this._sType;
            let oNameFilter = new Filter("name", FilterOperator.Contains, sQuery),
                oStoreFilter = new Filter("store", FilterOperator.Contains, sQuery);

            // sQuery가 존재할 경우 필터 적용
			if (sQuery) {
				aFilters.push(new Filter({
					filters: [oNameFilter, oStoreFilter],
					and: false
				}));
			}

            // sType이 존재할 경우 필터 적용
            if (sType) {
                aFilters.push(new Filter("type", FilterOperator.EQ, sType));
            }

            // Table 불러오기
            let oTable = this.getView().byId("productsTable");

            if (aFilters.length > 0) {
                // Table에 필터를 이중으로 적용하기 (AND)
                oTable.getBinding("items").filter(new Filter({
                    filters: aFilters,
                    and: true
                }));
            } else {
                // Table에 필터 초기화하기
                oTable.getBinding("items").filter([]);
            }
		},
        onRandom: function (oEvent) {
            // 현재 모델의 데이터 가져오기
            let oModel = this.getView().getModel().getData();

            // food 배열의 길이 가져오기
            let nMax = oModel.food.length;

            // 배열의 길이만큼 랜덤한 숫자를 뽑는 getRandomInt 함수 호출
            let nRandom = this._getRandomInt(0, nMax - 1);

            if (!this.pRandomDialog) {
                // Random Dialog 로드
                this.pRandomDialog = this.loadFragment({
                    name: "project261105.view.fragment.Random"
                })
            }

            // Dialog가 로드됐을 때
            this.pRandomDialog.then((oDialog) => {
                // Dialog에 랜덤한 번호의 행 가져오기
                oDialog.bindElement("/food/" + nRandom);

                // Dialog 열기
                oDialog.open();
            });
        },
        _getRandomInt: (min, max) => {
            // 랜덤 숫자 반환하기
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        onCloseRandomDialog: function() {
            // Random Dialog 닫기
            this.byId("idRandomDialog").close();
        },
        onOpenMap: function (oEvent) {
            // 상호명 가져오기
            let sStore = oEvent.getSource().getBindingContext().getProperty("store");

            // 상호명을 UTF-8로 인코딩하기
            let sQuery = encodeURIComponent(sStore);

            // 지도의 검색 결과에 인코딩된 상호명을 조합하여 주소 만들기
            let sUrl = "https://map.naver.com/p/search/" + sQuery;

            // URLHelper를 불러와서 지도 검색 결과 주소를 새 창으로 열기
            mobileLibrary.URLHelper.redirect(sUrl, true);
        },
        onAddDialog: function () {
            let oDialog = this.byId("idDialog");

            if (oDialog) {
                oDialog.setTitle("맛집 추가");
                this.byId("idDialogBtn").setText("추가");

                this.byId("idname").setValue("");
                this.byId("idstore").setValue("");
                this.byId("idtype").setSelectedKey("");
                this.byId("idstars").setSelectedKey("");
                this.byId("idrevisit").setSelectedKey("");
                this.byId("idimgurl").setValue("");
                this.byId("idmenu").setValue("");
                this.byId("idprice").setValue("");
                this.byId("idreview").setValue("");

                oDialog.open();
                return;
            }

            Fragment.load({
                // Dialog 안 id들 앞에 Main 이름표를 붙임
                // → Detail의 Dialog와 섞이지 않고, this.byId()로 찾을 수 있게 됨
                id: this.getView().getId(),
                name : "project261105.view.fragment.Dialog",
                type : "XML",
                controller : this,      // Dialog 버튼의 press 함수를 이 Main Controller에서 찾음
                }).then((oDialog) => {
                // 파일을 다 불러온 뒤에 실행되는 부분
                // 화살표 함수(=>)라서 이 안에서도 this가 Main Controller를 가리킴
                this.getView().addDependent(oDialog);                // Dialog를 Main 화면에 소속시킴
                oDialog.setTitle("맛집 추가");
                this.byId("idDialogBtn").setText("추가");
                oDialog.open();
            });
        },
        onSaveDialogBtn: function () {
            let addName = this.byId("idname").getValue();
            let addStore = this.byId("idstore").getValue();
            let addType = this.byId("idtype").getSelectedKey();
            let addStars = this.byId("idstars").getSelectedKey();
            let addRevisit = this.byId("idrevisit").getSelectedKey();
            let addImgurl = this.byId("idimgurl").getValue();
            let addMenu = this.byId("idmenu").getValue();
            let addPrice = this.byId("idprice").getValue();
            let addReview = this.byId("idreview").getValue();

            if (addName === "" || addStore === "" || addType === "" || addStars === "" ||
                addRevisit === "" || addImgurl === "" || addMenu === "" || addPrice === "" ||
                addReview === "") {
                MessageBox.warning("모든 항목을 입력해주세요.");
                return;
            }

            // data.json의 맛집 하나와 똑같은 모양으로 묶기
            let oNewFood = {
                name: addName,
                store: addStore,
                type: addType,
                star: Number(addStars),
                visit_again: addRevisit === "true",
                image: addImgurl,
                detail: [
                    {
                        menu: addMenu,
                        price: Number(addPrice),
                        review: addReview
                    }
                ]
            };

            // 맛집 목록을 꺼내서 맨 뒤에 새 맛집을 넣고(push), 다시 모델에 넣음
            // → 목록이 이 모델에 연결되어 있어서 화면에 새 줄이 자동으로 생김
            let AddModel = this.getView().getModel();
            let aFood = AddModel.getProperty("/food");
            aFood.push(oNewFood);
            AddModel.setProperty("/food", aFood);

            MessageToast.show("맛집이 추가되었습니다.");
            this.onCloseDialogBtn();
        },

        onCloseDialogBtn() {
            // Main 이름표가 붙은 Dialog라서 sap.ui.getCore().byId가 아니라 this.byId로 찾음
            this.byId("idDialog").close();
        },
        
        onDelete : function() {
            // 메인 뷰 내 식당 리스트 삭제

            // 1. Table 지정 및 SelectItems 정보 파악
            let oTable = this.byId("productsTable");
            let aSelect = oTable.getSelectedItems();   // [[0]{}, [4]{}, [5]{}]

            // 1-1) 삭제행 체크 안하면 에러메시지 나게
            // 복수(getSelectedItems)일때는 빈 배열(!aSelect)은 참이기 때문에 항상 false가 되므로 length로 확인
            if(aSelect.length === 0){      
                sap.m.MessageToast.show("삭제할 행을 선택하세요.");
                return;
            }
            // 1-2) 선택행 위치 번호 배열안에 모으기
            let aIndx = [];     // for문의 결과는 [0,4,5] 이렇게 쌓임
            for(let i=0; i < aSelect.length ; i++){
                let sPath = aSelect[i].getBindingContext().getPath();  // ex. /food/4
                aIndx.push(Number(sPath.split("/").pop()))
            }

            // 2. 삭제할 번호 외의 객체만 남김
            let oModel = this.getView().getModel();
            let aFood = oModel.getProperty("/food");
            let aNew = aFood.filter((o, idx) => !aIndx.includes(idx)); // 삭제 제외 모델데이터 만들기
                // includes (배열에 값이 있으면 true, 없으면 false) aIndx 값 돌리기
                // filter (객체, 번호) (food 모델 내 객체를 보며 false인거만 골라줌)


            // 3. 새로 만든 객체 배열 모델에 넣고 체크 해제
            oModel.setProperty("/food", aNew)
            oTable.removeSelections(true);  // ** .removeSelections 선택한 항목 해제하는 함수
            sap.m.MessageToast.show("삭제했습니다.");
        }
    });
});