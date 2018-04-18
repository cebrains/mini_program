//feedback.js
//获取应用实例
var app = getApp();
import { feedBackFetch } from '../../common/fetch';


Page({
    data: {
        allowSubmit: false,
        value: '',
        telVal: '',
        starNum: 0,
        // start: ['icon-start', 'icon-start', 'icon-start', 'icon-start', 'icon-start',],
        tag: [
            { text: '非常准，神了！', icon: 'icon-zan', checked: false,start:5 },
            { text: '还可以！不错！', icon: 'icon-zan', checked: false ,start:4},
            { text: '一般！', icon: 'icon-cai', checked: false ,start:3},
            { text: '不准呀！老铁', icon: 'icon-cai', checked: false ,start:2}
        ],
        selectedTag: '',
        SN:'',
        date:'',
        snDisabled:false
    },
    onLoad(){

        let d=new Date(),
            date=d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

        this.setData({
            date:date
        })
    },
    completeInput(e) {
        let { value } = e.detail,
            { selectedTag}=this.data;

        if (value && value != '') {
            this.setData({
                allowSubmit: true,
                value: value
            })
        }else{
            if (selectedTag != '' || selectedTag == '0'){
                this.setData({
                    allowSubmit: true,
                    value: ''
                })
            }else{
                this.setData({
                    allowSubmit: false,
                    value: ''
                })
            }
        }
    },
    setStar(e) {
        let { idx } = e.currentTarget.dataset;
        this.setData({
            starNum: parseInt(idx) + 1
        })
    },

    selectTag(e) {
        let { idx } = e.currentTarget.dataset,
            { tag } = this.data;

        let _tag = tag.map((val, index) => {
            if (index == idx) {
                val.checked = true;
            } else {
                val.checked = false;
            }
            return val;
        });

        this.setData({
            tag: _tag,
            selectedTag: idx,
            allowSubmit:true
        })
    },
    inpTel(e) {
        let { value } = e.detail;
        this.setData({
            telVal: value
        })
    },
    //提交
    clickSubBtn() {

        let { allowSubmit, value, selectedTag, tag,SN} = this.data;
        if (!allowSubmit){
            return 
        } 
console.log('sub : '+ value)
        if (value == '' && selectedTag!=0 && selectedTag=='') {
            return;
        }

        let data={};
        if ((selectedTag == '0' || selectedTag != '') && tag[selectedTag]){
            data.score = tag[selectedTag].start
        }

        if(value != ''){
            data.data=value;
        }
        if(SN != ''){
            data.conversationId=SN
        }

        feedBackFetch({
            sessionId: app.globalData.sessionId,
            data: JSON.stringify(data),
            cb(data) {
                wx.showModal({
                    content: '提交成功，感谢您的宝贵意见',
                    confirmText: '确定',
                    showCancel: false,
                    confirmColor: '#41B8B0',
                    success: function () {
                        wx.navigateBack()
                    }
                })
            }
        })


    },

    clickSNBtn(){
        let { conversationId}=app.globalData;

        if (conversationId && conversationId != ''){
            this.setData({
                SN: conversationId,
                snDisabled: true
            })
        }
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: '大数健康测评',
            path: "pages/inquiry/inquiry"
        }
    }
})
