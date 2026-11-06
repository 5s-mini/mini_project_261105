sap.ui.define([

], function() {
    "use strict";

    return {
        starNumber : function(sValue) {
            // sValue라는 파라미터 값으로 모델 데이터가 들어오게 됨
            if (!sValue) return;

            let result = "";
            
            switch (sValue) {
                case 1:
                    result = "★☆☆☆☆";
                break;
                case 2:
                    result = "★★☆☆☆";
                break;
                case 3:
                    result = "★★★☆☆";
                break;
                case 4:
                    result = "★★★★☆";
                break;
                case 5:
                    result = "★★★★★";
                break;
            }
            return result;
        }
    };
});