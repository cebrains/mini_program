//inquire.js
import { drugPlansFetch } from '../../common/fetch'
//获取应用实例
var app = getApp();

Page({
    data: {
      pathogenyArr:[],
      diseasePlanArr:[],
      showNoPlansPathogeny:false,
      showNoPlansDisease:false,
      titleName:''
      // test:[
      //   { id: "K29.501", name: "慢性胃炎", type: "EntityTypeDisease" }
      //   ,
      //   { id: "腹痛", name: "腹痛", type: "EntityTypeSymptom" },
      //   { id: "腹痛2", name: "腹痛2", type: "EntityTypeSymptom" }
      // ]
    },
    onLoad(option) {
       this.drugPlansFetchFun();
       console.log(option.name)
       if (option.name){
         this.setData({
           titleName: option.name
         });
       }      
    },
    //处理用药方案
    drugPlansFetchFun(){
      let movieid = getApp().drugplansId,
          movieSid = getApp().requestTalkId,
          self= this,
          data = {
          sid: movieSid,
          //sid:  "84c1cccef149917a48709c33714580bb92e3be16",
        ids: [
          {
            id: movieid,
            //id:"K29.501",
            type: 'EntityTypeDisease'
          }
        ]
      };
      drugPlansFetch({
        sessionId: app.globalData.sessionId,
        data: JSON.stringify(data),
        cb(data) {                  
          data.items.map(function (val) {
            if (val.items == undefined){
              self.setData({
                showNoPlansPathogeny:true,
                showNoPlansDisease:true
              });
            }else{
              val.items.map(function (val_son) {
                if (val.items.length >=2){              
                  self.setData({
                    showNoPlansPathogeny: false,
                    showNoPlansDisease: false
                  });
                  if (val_son.name === "病因治疗"){
                    self.setData({                      
                       pathogenyArr: val_son.items
                    });
                  } else if (val_son.name === "对症治疗"){
                    self.setData({                  
                      diseasePlanArr: val_son.items
                    });
                  }
                } else if (val_son.name === "对症治疗"){
                  self.setData({
                    showNoPlansDisease: false,
                    diseasePlanArr: val_son.items,
                    showNoPlansPathogeny:true
                  });
                } else if (val_son.name === "病因治疗") {
                  self.setData({
                    showNoPlansPathogeny:false,
                    pathogenyArr: val_son.items,
                    showNoPlansDisease: true
                  });
                }
              })              
            }            
          })
          
        }
      })
    }
    
})
