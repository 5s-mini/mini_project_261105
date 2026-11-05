sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project261105.controller.Detail", {
        onInit() {
            //컴포넌트에 있는 라우터 가져오기
            const oRouter = this.getOwnerComponent().getRouter();
            this.getOwnerComponent().getRouter().getRoute("RouteDetail").attachPatternMatched(this._onIdMatched, this); //pattern이 일치하면 실행
            
        },
        _onIdMatched(oEvent) {
            this.getView().bindElement("/food/" + oEvent.getParameter("arguments").paramId); //id를 뽑아내서 세부 주소 설정 후 바인딩
        },
        onClose() {
            this.getOwnerComponent().getRouter().navTo("RouteMain", { layout: "OneColumn" });
        }
    });
});