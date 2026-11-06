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
        },
        onCommentPress: function(){
            let oModel = this.getView().getModel();
           
             let commentName = this.byId("commentName").getValue();
             let commentInput = this.byId("commentInput").getValue();
             let StarRateCombo = Number(this.byId("starRate").getSelectedKey());

            // 현재 화면에 연결된 맛집 경로 뒤에 /comments를 붙여 댓글들이 저장된 경로 지정
            // ex) "/food/0" + "/comments" → "/food/0/comments"
             const sPath = this.getView().getBindingContext().getPath() + "/comments"; //"/food/0/comments"

             //해당 경로에 있는 배열 가져오기
             let aComments = oModel.getProperty(sPath);

             //경로에 배열이 없으면 /comments라는 경로에 빈 배열을 하나 만듦
             if (!aComments) {
                  aComments = [];
                 }

             // 댓글정보들을 해당 배열에 삽입시킴 
             aComments.push({ star: StarRateCombo, name: commentName, comment: commentInput });

             // 수정한 배열을 /comments에 교체
             oModel.setProperty(sPath, aComments);
         }

    });
});