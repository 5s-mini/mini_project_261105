sap.ui.define([

], function() {
    "use strict";


    return {
        StarCount : function(sValue) {
           // sValue 라는 파라미터 값으로 모델 데이터가 들어오게 됨
            if(!sValue) return;    //값이 없으면 그대로 종료

            let result = "";             //result를 우선 공백으로라도 정의해줌
            switch (Number(sValue)) {
                case 5 :
                    result = "★★★★★";
                    break;
                case 4 :
                    result = "★★★★☆";
                    break;
                case 3 :
                    result = "★★★☆☆";
                    break;
                case 2 : 
                    result = "★★☆☆☆";
                    break;
                case 1 : 
                    result = "★☆☆☆☆";
                    break;
            }
                return result;  //result 값이 화면에 표시됨
            }
        };
})