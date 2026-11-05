sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project261105.controller.Detail", {
        onInit() {
            this.getOwnerComponent().getRouter().getRoute("RouteDetail")
                .attachPatternMatched(this._onMatched, this);
        },
        _onMatched(oEvent) {
            this.getView().bindElement("/food/" + oEvent.getParameter("arguments").paramId);
        },
        onClose() {
            this.getOwnerComponent().getRouter().navTo("RouteMain", { layout: "OneColumn" });
        }
    });
});