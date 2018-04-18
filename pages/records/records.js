//index.js
//获取应用实例
import { recordsListFetch, statistics } from '../../common/fetch';

var app = getApp()
Page({
    data: {
        list: [
            // [
            //     {
            //         month: 7,
            //         day: 25
            //     },
            //     [{
            //         id: '001',
            //         nickname: 'Lian',
            //         gender: '男',
            //         age: '28',
            //         disease: '糖尿病头晕，恶心，四肢麻木',
            //         describe: '主要症状：头晕，恶心，四肢麻木头晕，恶心，四肢麻木头晕，恶心，四肢麻木'
            //     }, {
            //         id: '002',
            //         nickname: 'J',
            //         gender: '男',
            //         age: '38',
            //         disease: '动脉硬化',
            //         describe: '主要症状：头晕，恶心，四肢麻木'
            //     }]
            // ]
        ],
        size: 15,
        start: 0,
        haveMore: true,
        isLoading: false
    },
    
    onShow() {
        this.init();
    },

    init(){
        this.setData({
            list: [],
            size: 15,
            start: 0,
            haveMore: true,
            isLoading: false
        })
        this.fetchData({ size: 15, start: 0 });
    },

    fetchData(params) {
        let { size, start } = params,
            { isLoading, list, haveMore} = this.data,
            self = this;

        if (!isLoading && haveMore) {

            // wx.showLoading({
            //     title: '加载中',
            // })
            this.setData({
                isLoading: true
            })

            recordsListFetch({
                data: { size, start },
                sessionId: app.globalData.sessionId,
                cb(data) {
                    let { listData, haveMore, size, start } = self.handleRecordsListFetch(data,list);
                    
                    wx.hideLoading();
                    self.setData({
                        list: list.concat(listData),
                        haveMore,
                        size,
                        start,
                        isLoading: false
                    });
                    wx.stopPullDownRefresh();

                },
                failCb() {
                    wx.showModal({
                        content: '网络链接失败',
                        showCancel: false,
                        confirmColor: '#41B8B0'
                    
                    });
                    self.setData({
                        isLoading: false
                    })
                    // wx.hideLoading();
                    wx.stopPullDownRefresh();
                }
            })
        }
    },

    // 处理请求来到数据
    handleRecordsListFetch(data,oldList) {

        let listData = [];
        data.records && data.records.map(val => {

            let noHave = true;
            for (let i = 0; i < listData.length; i++) {
                if (listData[i][0].year == val.time.year && listData[i][0].month == val.time.month && listData[i][0].day == val.time.day) {
                    if (!listData[i][1]) {
                        listData[i][1] = [];
                    }
                    listData[i][1].push(val);
                    noHave = false;
                }
            }

            if (noHave) {
                let arr = [];
                arr[0] = {
                    year: val.time.year,
                    month: val.time.month,
                    day: val.time.day
                };
                arr[1] = [];
                arr[1].push(val);
                
                listData.push(arr)
            }
        })

        let haveMore = false,
            size = 15, start = 0;
        
        if (data.info) {
            haveMore = data.info.more ? true : false;
            size=data.info.size || 15;
            start= data.info.start || 0;
        }

        return { listData, haveMore, size, start }
    },

    clickList(e) {
        let { id, time, gender, age } = e.currentTarget.dataset;
        let url = `/pages/recordDetail/recordDetail?id=${id}&time=${time}&age=${age}&gender=${gender}`;

        // try {   
        //     statistics({
        //         options: [
        //             '$event=click_record_detail', '$app=wx-app-doctor'
        //         ],
        //         sessionId: app.globalData.sessionId
        //     })
        // } catch (e) { console.log(e) }

        wx.navigateTo({
            url: url
        })
    },

    // 滚动到底部加载
    scrollToLower() {
        let { start, size } = this.data;
        start =start;
        this.fetchData({ start, size })
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: '大数健康测评',
            path: "pages/inquiry/inquiry"
        }
    }
})
