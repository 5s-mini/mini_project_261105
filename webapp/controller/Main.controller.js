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
             // 종류 선택 목록용 모델 (처음엔 빈 목록)
            this.getView().setModel(new JSONModel({ types: [] }), "typeList");
        },
        onListItemPress(oEvent) {
            // 선택한 행의 경로 가져오기
            const sPath = oEvent.getParameter("listItem").getBindingContext().getPath(); // "/food/3"

            // 행 번호만 가져오기
            const sFoodId = sPath.split("/").pop();

            // Detail 페이지 주소 지정
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                paramId: sFoodId
            });
        },
        onHeaderPress : function(sField) {
            // 같은 열을 다시 누르면 방향 반대로, 다른 열이면 내림차순(좋은 것부터)
            this._bDesc = (this._sSortField === sField) ? !this._bDesc : true;
            this._sSortField = sField;

            let aSorters = [new Sorter(sField, this._bDesc)];
            this.byId("productsTable").getBinding("items").sort(aSorters);
        },
        onFilter : function (oEvent) {
            let oButton = oEvent.getSource();    // 누른 필터 버튼

            // ===== 1) 종류 목록 만들기 (방법 A) =====
            let aFood = this.getView().getModel().getProperty("/food");
            let aNames = [];                                    // 글자만 모으는 배열

            for (let i = 0; i < aFood.length; i++) {
                let sType = aFood[i].type.trim();
                if (sType !== "" && !aNames.includes(sType)) {  // 아직 없으면 추가
                    aNames.push(sType);
                }
            }

            let aTypes = [{ key: "", text: "전체" }];           // Select용 목록
            for (let i = 0; i < aNames.length; i++) {
                aTypes.push({ key: aNames[i], text: aNames[i] });
            }
            this.getView().getModel("typeList").setProperty("/types", aTypes);

            // ===== 2) Popover 열기 (그대로) =====
            if (!this._pTypePopover) {
                this._pTypePopover = this.loadFragment({
                    name: "project261105.view.fragment.Filter"
                });
            }
            this._pTypePopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },
        onTypeSelect : function (oEvent) {
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
            let oDialog = sap.ui.getCore().byId("idDialog");              // 학생 관리 Dialog가 이미 만들어져 있는지 id로 찾는다 (없으면 undefined)

            // Dialog Fragment 파일 저장해두기
            if(oDialog) {
                oDialog.setTitle("맛집 추가");
                sap.ui.getCore().byId("idDialogBtn").setText("추가");
                
                let addName = sap.ui.getCore().byId("idname").setValue();
                let addStore = sap.ui.getCore().byId("idstore").setValue();
                let addType = sap.ui.getCore().byId("idtype").setSelectedKey();
                let addStars = sap.ui.getCore().byId("idstars").setSelectedKey();
                let addRevisit = sap.ui.getCore().byId("idrevisit").setSelectedKey();
                let addImgurl = sap.ui.getCore().byId("idimgurl").setValue();

                let addMenu = sap.ui.getCore().byId("idmenu").setValue();
                let addPrice = sap.ui.getCore().byId("idprice").setValue();
                let addReview = sap.ui.getCore().byId("idreview").setValue();

                oDialog.open();

                return;
            }

            Fragment.load({
                name : "project261105.view.fragment.Dialog",              // 불러올 파일 위치 (webapp/view/fragment/Dialoged.fragment.xml)
                type : "XML",                                               // 파일 형식
                controller : this,                                          // Dialog 안 이벤트 함수는 Main 컨트롤러에서 찾도록 연결
            }).then(function(oDialog) {                                     // 파일을 다 읽어서 Dialog가 만들어지면 실행
                oDialog.setTitle("맛집 추가");
                sap.ui.getCore().byId("idDialogBtn").setText("추가");
                oDialog.open();
            });
        },
        onSaveDialogBtn: function () {
            let addName = sap.ui.getCore().byId("idname").getValue();
            let addStore = sap.ui.getCore().byId("idstore").getValue();
            let addType = sap.ui.getCore().byId("idtype").getSelectedKey();
            let addStars = sap.ui.getCore().byId("idstars").getSelectedKey();
            let addRevisit = sap.ui.getCore().byId("idrevisit").getSelectedKey();
            let addImgurl = sap.ui.getCore().byId("idimgurl").getValue();
            let addMenu = sap.ui.getCore().byId("idmenu").getValue();
            let addPrice = sap.ui.getCore().byId("idprice").getValue();
            let addReview = sap.ui.getCore().byId("idreview").getValue();

            if (addName === "" || addStore === "" || addType === "" || addStars === "" ||
            addRevisit === "" || addImgurl === "" || addMenu === "" || addPrice === "" ||
            addReview === "") {
                MessageBox.warning("모든 항목을 입력해주세요.");
                return;
            }

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
            let AddModel = this.getView().getModel();
            let aFood = AddModel.getProperty("/food");
            aFood.push(oNewFood);
            AddModel.setProperty("/food", aFood);

            MessageToast.show("맛집이 추가되었습니다♥");
            this.onCloseDialogBtn();
        },
        onCloseDialogBtn() {
            sap.ui.getCore().byId("idDialog").close();
        },
        onDelete : function() {
            let oTable = this.byId("productsTable");
            let aSelect = oTable.getSelectedItems();   // [[0]{}, [4]{}, [5]{}]

            // 체크 안하면 에러메시지 나
            // 복수(getSelectedItems)일때는 빈 배열(!aSelect)은 참이기 때문에 항상 false가 되므로 length로 확인
            if(aSelect.length === 0){      
                sap.m.MessageToast.show("삭제할 행을 선택하세요.");
                return;
            }
            // 1. 선택행 위치 번호 배열안에 모으기
            let aIndx = [];     // for문의 결과는 [1,3,7] 이렇게 쌓임
            for(let i=0; i < aSelect.length ; i++){
                let sPath = aSelect[i].getBindingContext().getPath();  // ex. /food/1
                aIndx.push(Number(sPath.split("/").pop()))
            }

            // 2. 삭제할 번호 외의 객체만 남김
            let oModel = this.getView().getModel();
            let aFood = oModel.getProperty("/food");
            let aNew = aFood.filter((o, idx) => !aIndx.includes(idx));
                // includes (배열에 값이 있으면 true, 없으면 false) aIndx 값 돌리기
                // filter (객체, 번호) (food 모델 내 객체를 보며 false인거만 골라줌)


            // 3. 새로 만든 객체 배열 모델에 넣고 체크 해제
            oModel.setProperty("/food", aNew)
            oTable.removeSelections(true);  // 선택한 항목 해제하는 함수
            sap.m.MessageToast.show("삭제했습니다.");
        }
    });
});