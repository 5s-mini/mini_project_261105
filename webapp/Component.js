sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "project261105/model/models"
], (UIComponent, JSONModel, models) => {
    "use strict";
    return UIComponent.extend("project261105.Component", {
        metadata: { manifest: "json", interfaces: ["sap.ui.core.IAsyncContentCreation"] },

        init() {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(new JSONModel({ layout: "OneColumn" }), "appView");

            const oRouter = this.getRouter();
            oRouter.attachBeforeRouteMatched((oEvent) => {
                const sLayout = oEvent.getParameter("arguments").layout || "OneColumn";
                this.getModel("appView").setProperty("/layout", sLayout);
            });
            oRouter.initialize();
        }
    });
});