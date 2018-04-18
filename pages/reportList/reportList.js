//reportList.js
//获取应用实例
var app = getApp()
import { wikiFetch } from '../../common/fetch';

Page({
    data: {
        report: [],
        num1: {},
        recallDetail: '',
        isRecall: false
    },

    onLoad: function (options) {
        // let { diagnosis, recall } = app.globalData.diagnoseResult[option.sn];
        let { diagnoseResult } = app.globalData, 
            diagnose, recall;
        console.log('diagnoseResult ', diagnoseResult )
        
        for (let i = 0; i < diagnoseResult.length;i++){
            if (diagnoseResult[i].sn==options.idx){
                diagnose = JSON.parse(JSON.stringify(diagnoseResult[i].diagnosis));
                recall = JSON.parse(JSON.stringify(diagnoseResult[i].recall));
                break;
            }
        }
        app.setDiagnosis(diagnose);
        
        this.initPageData({ diagnose, recall});
    },

    initPageData(params) {
        let { diagnose, recall}=params,
            item = diagnose.shift();
            console.log(recall)

        let isRecall = false,
            recallDetail = '';
        if (recall.isRecall) {
            isRecall = recall.isRecall;
            recallDetail = recall.notification ? (recall.notification.text ? recall.notification.text :''): '';
        }

        this.setData({
            report: diagnose.slice(0, 7),
            num1: item,
            isRecall,
            recallDetail
        })
    },

    //查看百科
    enterWiki(e) {
        let { id } = e.currentTarget.dataset;
        if (wx.showLoading) {
            wx.showLoading({
                title: '加载中',
            })
        }

        console.log(id)

        wikiFetch({
            id,
            sessionId: app.globalData.sessionId,
            cb(data) {
                if(!data){
                    return;
                }

                let wiki = {
                    id: data.id,
                    name: data.name,
                    items: []
                }
                data.items.length > 0 && data.items.map((val, idx) => {
                    wiki.items.push({
                        title: val.title,
                        describe: val.text,
                        // diagnose: val.diagnose,
                        show: idx == 0 ? true : false
                    })
                });

                app.globalData.wiki = wiki;

                try {
                    wx.hideLoading()
                } catch (e) { console.log(e) };

                wx.navigateTo({
                    url: '/pages/wiki/wiki?id=' + id,
                })
            }
        })
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: '大数健康测评',
            path: "pages/inquiry/inquiry"
        }
    },
    //去用药详情的页面查看详情 by zqy
    toDrugSchemePage(e){
      let { id } = e.currentTarget.dataset,
          title_name=e.currentTarget.dataset.name;
      app.drugplansId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/drugScheme/drugScheme?name=' + title_name,
      })


    }
})
