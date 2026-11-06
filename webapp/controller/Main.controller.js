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
        oFormat : formatter,
        onInit() {
        },
        /* ===== [A] 목록 · 네비게이션 ===== */
        onListItemPress(oEvent) {
            const sPath = oEvent.getParameter("listItem").getBindingContext().getPath(); // "/food/3"
            const sFoodId = sPath.split("/").pop();

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                paramId: sFoodId
            });
        },
        /* ===== [A] end ===== */

        /* ===== [B] 검색 · 필터 · 정렬 ===== */
        // onUpdateFinished: function (oEvent) {
        // },
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
        onOpenMap: function (oEvent) {
            let sStore = oEvent.getSource().getBindingContext().getProperty("store");
            let sQuery = encodeURIComponent(sStore);
            let sUrl = "https://map.kakao.com/link/search/" + sQuery;

            let URLHelper = mobileLibrary.URLHelper;
            URLHelper.redirect(sUrl, true);
        }
        // onTypeFilterChange: function (oEvent) {
        // },
        // onSortPress: function () {
        // },
        // _applyFilters: function () {
        // },
        // /* ===== [B] end ===== */

        // /* ===== [D] 추가 · 삭제 · 뽑기 ===== */
        // onOpenAddDialog: function () {
        // },
        // onSaveAdd: function () {
        // },
        // onCancelAdd: function () {
        // },
        // onDelete: function (oEvent) {
        // },
        // onRandomPick: function () {
        // }
        /* ===== [D] end ===== */
    });
});