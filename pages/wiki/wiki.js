//index.js
//获取应用实例
var app = getApp()

Page({
    data: {
        id:'',
        wiki: [
            // {
            //     title: '典型症状',
            //     describe: "这是一大串文字",
            //     show: false
            // }
        ],
        name: '',
        drugPlans:[]
    },

    onLoad: function (options) {
        this.init(options);
    },
    
    init(options){
        let { wiki, diagnosis}=app.globalData,
            { id } = options, drugPlans;
            console.log(diagnosis)
            console.log(id)
        for(let i=0;i<diagnosis.length;i++){
            if (diagnosis[i].id==id){
                console.log(diagnosis[i].drugPlans);
                drugPlans = diagnosis[i].drugPlans
            }
        }

        this.setData({
            id:id,
            wiki: wiki.items,
            name:wiki.name,
            drugPlans
        })
    },

    clickTitle: function (e) {
        let idx = e.currentTarget.dataset.idx;
        let { wiki } = this.data;
        let _wiki = JSON.parse(JSON.stringify(wiki));

        _wiki[idx].show = !_wiki[idx].show;

        this.setData({
            wiki: _wiki
        })
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: '大数健康测评',
            path: "pages/inquiry/inquiry"
        }
    }

})
