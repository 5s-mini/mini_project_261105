sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project261105.controller.Main", {
        onInit() {
            let oModel = new JSONModel();                               
            oModel.loadData("../model/data.json", {}, false);       
            this.getOwnerComponent().setModel(oModel); // JSONModel 생성
        }
    });
});