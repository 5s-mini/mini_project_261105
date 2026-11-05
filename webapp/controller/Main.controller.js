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
            let oModel = new JSONModel();                               
            oModel.loadData("../model/data.json", {}, false);       
            this.getOwnerComponent().setModel(oModel); // JSONModel 생성
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