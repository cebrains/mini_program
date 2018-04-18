//index.js
//获取应用实例
var app = getApp();
import { wikiFetch, inquiryRecordFetch, statistics } from '../../common/fetch';

Page({
    data: {
        id: '',
        time: [],
        nickname: '',
        gender: '',
        age: '',
        symptoms: [
            // {
            //     category: '自选症状',
            //     detail: ['头痛头痛头痛']
            // }
        ],
        labItems: [
            // '白细胞基数—偏高',
        ],
        diagnoses: [
            // {
            //     id: '001',
            //     weight: '40',
            //     name: '糖尿病'
            // }
        ],
        cardState: false
    },

    onLoad(options) {
        // console.log(options.id);
        this.setData({
            id: options.id
        })
        this.init(options.id)
    },

    // onPullDownRefresh: function () {
    //     let self = this;
    //     console.log('-------下拉刷新-------')
    //     self.init(self.data.id);
    // },

    init(id) {
        this.fetchData({ id, method: 'GET' });
    },

    toggleCard() {
        let { cardState } = this.data;
        this.setData({
            cardState: !cardState
        })
    },

    fetchData(json) {
        let { id, method } = json,
            self = this;

        wx.showLoading({
            title: '加载中...',
        })

        inquiryRecordFetch({
            sessionId: app.globalData.sessionId,
            method: method,
            data: JSON.stringify({ id: id }),
            id: id,
            cb(data) {
                wx.hideLoading();
                let _data = data.record || {};

                _data.id=id;     //修正id

                if (method == "DELETE") {

                    // try {
                    //     statistics({
                    //         options: [
                    //             '$event=click_delete_record', '$app=wx-app-doctor'
                    //         ],
                    //         sessionId: app.globalData.sessionId
                    //     })
                    // } catch (e) { console.log(e) }

                    wx.navigateBack();
                } else if (method == 'GET') {
                    self.handleData(_data);
                }
                wx.stopPullDownRefresh();
            }
        })
    },

    handleData(data) {
        let { diagnoses, inputSymptoms, negativeSymptoms, symptoms } = data;
        let newR=[];
        if(diagnoses){
            newR = diagnoses.map(val => {
                let weight = (val.weight * 100).toFixed(1);
                val.weight = weight;
                return val;
            });
        }
         
        app.setDiagnosis(newR);
        
        //时间
        let timeArr = [data.time];

        //基本信息
        let basic = '';
        if (data.nickname && data.nickname != '') {
            basic += data.nickname + ' '
        }
        if (data.gender && data.gender != '') {
            basic += data.gender + ' '
        }
        if (data.age && data.age != '') {
            basic += data.age + '岁'
        }

        //症状
        let _symptom = [],
            _inpSym = {
                category: '自选症状',
                detail: []
            },
            _noSym = {
                category: '没有症状',
                detail: []
            },
            _syms = {
                category: '追问症状',
                detail: []
            },
             _symptoms=[];

        let inpArr=[];
        inputSymptoms && inputSymptoms.map(val => {
            inpArr.push(val.name)
        })
        _inpSym.detail.push(inpArr.join(' , '));
        _symptoms.push(_inpSym);

        symptoms && symptoms.map(val => {
            let str = '';
            str += val.name;
            if (val.attrs && val.attrs.length > 0) {
                str += '(';
                str += val.attrs.join(' , ');
                str += ")"
            }
            _syms.detail.push(str);
        })
        _symptoms.push(_syms);

        let noArr=[];
        negativeSymptoms && negativeSymptoms.map(val => {
            noArr.push(val.name)
        })
        _noSym.detail.push(noArr.join(' , '));
        _symptoms.push(_noSym);

        let _data = Object.assign({}, data, {
            diagnoses: newR,
            time: timeArr,
            basic: [basic],
            symptoms: _symptoms
        })

        this.setData(
            _data
        )
    },

    //删除
    clickDelete(e) {
        let { id } = e.currentTarget.dataset,
            self = this;
        wx.showModal({
            title: '提示',
            content: '您确定删除记录吗？',
            confirmText: '删除',
            confirmColor: '#E64340',
            success: function (res) {
                if (res.confirm) {
                    self.fetchData({ id, method: 'DELETE' });
                }
            }
        })
    },

    // 查看wiki
    clickResultLi(e) {
        let { id } = e.currentTarget.dataset;

        if (wx.showLoading) {
            wx.showLoading({
                title: '加载中',
            })
        }

        wikiFetch({
            id,
            sessionId: app.globalData.sessionId,
            cb(data) {
                let wiki = {
                    id: data.id,
                    name: data.name,
                    items: []
                }
                data.items.length > 0 && data.items.map((val, idx) => {
                    wiki.items.push({
                        title: val.title,
                        describe: val.text,
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
    }
})
