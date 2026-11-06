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
            const sPath = oEvent.getParameter("listItem").getBindingContext().getPath(); // "/food/3"
            const sFoodId = sPath.split("/").pop();

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                paramId: sFoodId,
                layout: "TwoColumnsMidExpanded"
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

            // 2. 표의 items 바인딩 가져오기
            let oBinding = this.byId("productsTable").getBinding("items");

            // 3. "전체"면 필터 해제, 아니면 그 종류만 보이게
            if (sKey === "") {
                oBinding.filter([]);
            } else {
                oBinding.filter(new Filter("type", FilterOperator.EQ, sKey));
            }

            // 4. Popover 닫기
            this.byId("Filter").close();
        },
        onSearch: function (oEvent) {
            // 검색 창에 입력한 내용 불러오기
			let sQuery = oEvent.getParameter("query");

            // filter 배열 설정, data.json의 name(메뉴명) 속성값이 sQuery와 일치 여부를 검사하는 oFilter 선언
            let aFilters = [];
            let oFilter = new Filter("name", FilterOperator.Contains, sQuery);

            // sQuery의 입력값 예외 확인
			if (sQuery && sQuery.length > 0) {
				aFilters.push(oFilter);
			}

            // Table 불러오기
            let oTable = this.getView().byId("productsTable");

            // Table에 filter 배열 적용하기
			oTable.getBinding("items").filter(aFilters);
		},
        onRandom: function (oEvent) {
            let oModel = this.getView().getModel().getData();
            let nMax = oModel.food.length;
            let nRandom = this.getRandomInt(1, nMax - 1);

            if (!this.pRandomDialog) {
                // Random Dialog 로드
                this.pRandomDialog = this.loadFragment({
                    name: "project261105.view.fragment.Random"
                })
            }

            // Dialog가 로드됐을 때
            this.pRandomDialog.then((oDialog) => {
                // Dialog 열기
                oDialog.bindElement("/food/" + nRandom);
                oDialog.open();
            });
        },
        getRandomInt: (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        onCloseRandomDialog: function() {
            this.byId("idRandomDialog").close();
        },
        onOpenMap: function (oEvent) {
            let sStore = oEvent.getSource().getBindingContext().getProperty("store");
            let sQuery = encodeURIComponent(sStore);
            let sUrl = "https://map.naver.com/p/search/" + sQuery;

            let URLHelper = mobileLibrary.URLHelper;
            URLHelper.redirect(sUrl, true);
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
        }
        // onTypeFilterChange: function (oEvent) {
        // },
        // onSortPress: function () {
        // },
        // _applyFilters: function () {
        // },
        // /* ===== [B] end ===== */

        // /* ===== [D] 추가 · 삭제 · 뽑기 ===== */
        // onCancelAdd: function () {
        // },
        // onDelete: function (oEvent) {
        // },
        // onRandomPick: function () {
        // }
        /* ===== [D] end ===== */
    });
});