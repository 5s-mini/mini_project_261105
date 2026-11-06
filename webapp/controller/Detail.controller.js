sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "project261105/model/formatter"
], (Controller, MessageToast,formatter) => {
    "use strict";

    return Controller.extend("project261105.controller.Detail", {
        formatter:formatter,
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            // RouteDetail의 패턴이 일치하면, _onPatternMatched 라는 함수를 실행
            oRouter.getRoute("RouteDetail").
                attachPatternMatched(this._onPatternMatched, this);
        },
        _onPatternMatched(oEvent) {
            let sFoodId = oEvent.getParameter("arguments").paramId;
            let sPath = "/food/" + sFoodId;
            let oModel = this.getOwnerComponent().getModel();

            // 주소창에 바로 입력해서 들어온 경우 data.json이 아직 안 왔을 수 있으므로 기다린다
            oModel.dataLoaded().then(() => {
                this.getView().bindElement(sPath); // 해당 맛집 데이터를 화면에 연결
            });
        },
        onNavButtonPress: function() {
            // manifest.json에 등록된 Router 정보 가져오기
            const oRouter = this.getOwnerComponent().getRouter();

            // Router 중에서, RouteMain(라우터 이름)로 이동 -> 메인 화면으로 이동
            oRouter.navTo("RouteMain");
        }
    });
});