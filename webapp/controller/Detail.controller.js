sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "project261105/model/formatter"
], (Controller, MessageToast, MessageBox, JSONModel, Fragment, formatter) => {
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
        },

        onEditBtn() {

            // 저장할 때 덮어쓸 위치 (예: "/food/3")
            this.sPath = this.getView().getBindingContext().getPath();

            // 지금 화면에 보이는 맛집 데이터 {name: '구내식당', store: '모르겠음', type: '한식', star: 2, visit_again: true, …}
            let oFood = this.getView().getBindingContext().getObject();     

            let oDialog = this.byId("idDialog");

            // Dialog가 이미 있으면: 제목, 버튼 글자 바꾸고 Input 채우고 열기
            if (oDialog) {
                oDialog.setTitle("맛집 수정");
                this.byId("idDialogBtn").setText("저장");
                this.byId("idname").setValue(oFood.name);
                this.byId("idstore").setValue(oFood.store);
                this.byId("idtype").setSelectedKey(oFood.type);
                this.byId("idstars").setSelectedKey(String(oFood.star));
                this.byId("idrevisit").setSelectedKey(String(oFood.visit_again));
                this.byId("idimgurl").setValue(oFood.image);
                this.byId("idmenu").setValue(oFood.detail[0].menu);
                this.byId("idprice").setValue(oFood.detail[0].price);
                this.byId("idreview").setValue(oFood.detail[0].review);

                oDialog.open();
                return;
            }

            // Dialog가 없으면: 처음 만들고, 제목, 버튼 글자 바꾸고 Input 채우고 열기
            Fragment.load({
                id: this.getView().getId(),
                // Dialog 안 id들 앞에 Detail 이름표를 붙임
                // => Main의 Dialog와 섞이지 않고, this.byId()로 찾을 수 있게 됨
                name: "project261105.view.fragment.Dialog",
                type: "XML",
                controller: this        // Dialog의 이벤트 함수를 이 Detail Controller에서 찾음
            }).then((oDialog) => {
                // 파일을 다 불러온 뒤에 실행되는 부분
                // 화살표 함수(=>)라서 이 안에서도 this가 Detail Controller를 가리킴                            
                this.getView().addDependent(oDialog);           // => Dialog를 Detail 화면에 소속시킴
                oDialog.setTitle("맛집 수정");
                this.byId("idDialogBtn").setText("저장");

                this.byId("idname").setValue(oFood.name);
                this.byId("idstore").setValue(oFood.store);
                this.byId("idtype").setSelectedKey(oFood.type);
                this.byId("idstars").setSelectedKey(String(oFood.star));
                this.byId("idrevisit").setSelectedKey(String(oFood.visit_again));
                this.byId("idimgurl").setValue(oFood.image);
                this.byId("idmenu").setValue(oFood.detail[0].menu);
                this.byId("idprice").setValue(oFood.detail[0].price);
                this.byId("idreview").setValue(oFood.detail[0].review);

                oDialog.open();
            });
        },

        onSaveDialogBtn() {

            // Input에 입력된(수정된) 값 꺼내기
            let editName = this.byId("idname").getValue();
            let editStore = this.byId("idstore").getValue();
            let editType = this.byId("idtype").getSelectedKey();
            let editStars = this.byId("idstars").getSelectedKey();
            let editRevisit = this.byId("idrevisit").getSelectedKey();
            let editImgurl = this.byId("idimgurl").getValue();
            let editMenu = this.byId("idmenu").getValue();
            let editPrice = this.byId("idprice").getValue();
            let editReview = this.byId("idreview").getValue();

            // 빈 칸이 하나라도 있으면 경고창 띄우고 끝내기
            if (editName === "" || editStore === "" || editType === "" || editStars === "" ||
                editRevisit === "" || editImgurl === "" || editMenu === "" || editPrice === "" ||
                editReview === "") {
                MessageBox.warning("모든 항목을 입력해주세요.");
                return;
            }

            // json 형식과 똑같이 묶기 (Main의 추가와 같은 모양)
            let oEditFood = {
                name: editName,
                store: editStore,
                type: editType,
                star: Number(editStars),              // "3" → 3
                visit_again: editRevisit === "true",  // O → true, X → false
                image: editImgurl,
                detail: [
                    {
                        menu: editMenu,
                        price: Number(editPrice),     // "9000" → 9000
                        review: editReview
                    }
                ]
            };

            // onEditBtn에서 저장해둔 위치("/food/3")의 데이터를 새 데이터로 덮어씀
            // → 화면이 이 위치에 연결되어 있어서 Detail 화면과 Main 목록이 자동으로 바뀜
            this.getView().getModel().setProperty(this.sPath, oEditFood);

            // 안내 메시지 띄우고 Dialog 닫기
            MessageToast.show("맛집 정보가 수정되었습니다.");
            this.onCloseDialogBtn();
        },
        onCloseDialogBtn() {
            // Detail 이름표가 붙은 Dialog라서 sap.ui.getCore().byId가 아니라 this.byId로 찾음
            this.byId("idDialog").close();
        }

    });
});