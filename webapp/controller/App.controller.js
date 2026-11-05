sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("project261105.controller.App", {
      onInit() {
        this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
      }
  });
});