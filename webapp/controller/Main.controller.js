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
        // formatter: formatter,

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
        // onSearch: function (oEvent) {
        // },
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