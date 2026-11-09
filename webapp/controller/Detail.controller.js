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

            //detatail페이지에 연결시 별점 평균 계산
                this.onStarMean();
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
           
             let commentName = this.byId("commentName").getValue().trim();
             let commentInput = this.byId("commentInput").getValue().trim();
             let StarRateCombo = Number(this.byId("starRate").getSelectedKey());

             //닉네임과 댓글 모두 작성이 되야 댓글 적용 
             if(!commentName||!commentInput){
                sap.m.MessageToast.show("모든 항목을 입력해주세요.");
                return; //작성이 되지 않으면 함수 종료
             }

            //작성이 되었다면 날짜 가져오기
            let today = new Date();

            //년 월 일 가져오기
            let year = today.getFullYear();
            let month = today.getMonth() + 1;    
            let date = today.getDate();          

            //시분초 가져오기
            let hours = today.getHours();       
            let minutes = today.getMinutes();   
            let seconds = today.getSeconds();
            
            //시간 날짜 문자열 만들기
            let sDate = year +" / "+ month + " / " + date;
            let sTime = hours + ":" + minutes + ":" + seconds;

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
            aComments.push({ CommentStar : StarRateCombo, name : commentName, comment : commentInput, date : sDate, time : sTime});

            // 수정한 배열을 /comments에 교체
             oModel.setProperty(sPath, aComments);

            //별점 평균 업데이트
             this.onStarMean()
            
            //input 초기화
            this.byId("commentName").setValue("");
            this.byId("commentInput").setValue("");

            sap.m.MessageToast.show("댓글 입력 완료!");
                    

        },
onEditBtn() {

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
            
                // Dialog 별점에는 평균이 아닌 원래 리뷰 별점을 표시
                // originStar는 Detail에서 평균 계산 후 생기므로, 아직 없으면 star가 원래 별점
                this.byId("idstars").setSelectedKey(String(oFood.originStar || oFood.star));

                this.byId("idrevisit").setSelectedKey(String(oFood.visit_again));
                this.byId("idimgurl").setValue(oFood.image);
                this.byId("idmenu").setValue(oFood.detail[0].menu);
                this.byId("idprice").setValue(oFood.detail[0].price);
                this.byId("idreview").setValue(oFood.detail[0].review);

                oDialog.open();
                return;
            }

            // Dialog가 없으면: 처음 만들고, 제목, 버튼 글자 바꾸고 입력값 채우고 열기
            this.loadFragment({
                name: "project261105.view.fragment.Dialog"
            }).then((oDialog) => { 
                // 화살표 함수(=>)라서 이 안에서도 this가 Main controller를 가리킴

                oDialog.setTitle("맛집 수정");
                this.byId("idDialogBtn").setText("저장");
                this.byId("idname").setValue(oFood.name);
                this.byId("idstore").setValue(oFood.store);
                this.byId("idtype").setSelectedKey(oFood.type);

                // Dialog 별점에는 평균이 아닌 원래 리뷰 별점을 표시
                // (originStar는 Detail에서 평균 계산 후 생기므로, 아직 없으면 star가 원래 별점)
                this.byId("idstars").setSelectedKey(String(oFood.originStar || oFood.star));

                this.byId("idrevisit").setSelectedKey(String(oFood.visit_again));
                this.byId("idimgurl").setValue(oFood.image);
                this.byId("idmenu").setValue(oFood.detail[0].menu);
                this.byId("idprice").setValue(oFood.detail[0].price);
                this.byId("idreview").setValue(oFood.detail[0].review);

                oDialog.open();
            });
        },

        onSaveDialogBtn() {

            // 저장할 때 덮어쓸 위치 구하기 (예: "/food/3")
            // Detail View에 연결된 맛집 데이터 정보에서 주소(경로)를 this.sPath에 저장
            this.sPath = this.getView().getBindingContext().getPath();
        

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

            //리뷰 수정 시 댓글이 지워지는 현상 fix
            // const oOldFood = this.getView().getModel().getProperty(this.sPath);
            // oEditFood.comments = oOldFood.comments || [];   //수정 전 모델에서 댓글 배열을 가져와서 댓글 유지, 없으면 빈 배열

            // 위에서 구한 위치("/food/3")의 데이터를 새 데이터로 덮어씀 
            // → 화면이 이 위치에 연결되어 있어서 Detail 화면과 Main 목록이 자동으로 바뀜
            this.getView().getModel().setProperty(this.sPath, oEditFood);

            // 안내 메시지 띄우고 Dialog 닫기
            MessageToast.show("맛집 정보가 수정되었습니다.");

            // // Dialog에서 별점 수정되면 별점 평균에 반영
            // this.onStarMean();

            this.onCloseDialogBtn();
        },
        onCloseDialogBtn() {
            // Detail 이름표가 붙은 Dialog라서 sap.ui.getCore().byId가 아니라 this.byId로 찾음
            this.byId("idDialog").close();
        },
        onStarMean : function(){
            //별점 평균 업데이트 해주는 함수

            //댓글들이 저장돼있는 배열 접근 댓글들 내용 나옴[{댓글1},{댓글2}]
            let aCommentsData = this.byId("commentTable").getBindingContext().getProperty("comments"); 
            
            //댓글이 없으면 배열도 없으므로 빈 배열로 지정
            if (!aCommentsData){
                aCommentsData = [];
            }
            
            //배열 길이 구하기
            let commentLength = aCommentsData.length;
            
            let oModel = this.getOwnerComponent().getModel(); //메인모델 불러오기

             // 현재 화면에 연결된 맛집 경로 (예: "/food/0")
            let sPath = this.getView().getBindingContext().getPath();  

            // 원래 리뷰 작성자가 준 별점(originStar) 가져오기
            // star에는 평균이 덮어써지므로, 평균 계산의 기준이 될 원래 별점을 따로 보관
            let originStar = oModel.getProperty(sPath+"/originStar");

            // 처음 계산할 때(또는 맛집 수정 직후)는 originStar가 아직 없음
            // 이때의 star는 아직 평균이 아닌 원래 별점이므로 originStar로 복사해서 보관
            if (originStar === undefined){
                let reviewStar = oModel.getProperty(sPath+"/star");
                oModel.setProperty(sPath+"/originStar",reviewStar);

                originStar = reviewStar;
            }

            // 원래 리뷰 작성자가 준 별점 sum의 기본값으로 설정
            let sum = originStar;
            
             // 댓글들의 별점을 하나씩 더함
            for(let i = 0; i<commentLength; i++){
                sum = sum+aCommentsData[i].CommentStar;
            }
            
            // 평균 = 합계 ÷ 전체 개수 (원래 리뷰 1개 + 댓글 수)
            // 예: 원래 4점 + 댓글 5점, 3점 → (4+5+3) / 3 = 4.0
            let meanStarValue = sum/(commentLength+1);

            // starNumber는 1~5만 처리하므로 반올림 (3.5 → 4)
            let meanStarIconValue = Math.round(meanStarValue);

            let sStar = formatter.starNumber(meanStarIconValue); //포메터 적용
            this.byId("starMean").setText(sStar);                //별점 내용 수정
            this.byId("TitleStarText").setText(sStar);           //헤더 별점 수정
            this.byId("starRateText").setText(meanStarValue.toFixed(1)) //소수점 평균

            // 평균을 star에 저장 → Main 목록 별점도 평균으로 표시됨
            //원래 별점은 originStar에 따로 보관
            this.getView().getModel().setProperty(sPath + "/star", meanStarIconValue);
            
        },
        onCommentDelete : function(oEvent) {
            // 댓글 Table의 삭제 버튼을 눌렀을 때 실행

            // 삭제 버튼을 누른 행의 경로 '/food/7/comments/0'
            let delPath = oEvent.getParameters().listItem.getBindingContext().getPath();
            
            // 경로를 "/"로 나눠 마지막 값(댓글 순번)만 꺼냄 → "0"
            let aDelPath = delPath.split("/");
            let delNum = aDelPath.pop();

            // 현재 맛집의 댓글 배열 경로 '/food/7/comments'
            let sPath = this.getView().getBindingContext().getPath() + "/comments"; 

            // 댓글 배열을 꺼내서 해당 순번의 댓글 1개 삭제
            let aComment = this.getOwnerComponent().getModel().getProperty(sPath);
            aComment.splice(delNum,1);

            // 삭제된 배열을 다시 저장 -> 댓글 Table 자동 갱신
            this.getOwnerComponent().getModel().setProperty(sPath,aComment);

            // 댓글이 줄었으니 별점 평균 다시 계산
            this.onStarMean();
         }

    });
});