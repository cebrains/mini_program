
//app.js
App({
  onLaunch: function () {
    let self = this;
    this.globalData.userInfo = wx.getStorageSync('userInfo') || {};
    this.globalData.sessionId = '';

    if (!wx.reLaunch || !wx.showLoading || !wx.login || !wx.getUserInfo) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: 'false'
      })
    }
  },

  isFetching: false,
  checkUser(cb) {
    // wx.showLoading({
    //   title: '加载中...',
    // })

    let self = this;
    wx.request({
      url: 'https://oauth2.rxthinking.com/wx-app/ok',
      data: '{}',
      method: "GET",
      header: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Authorization": 'bearer ' + self.globalData.sessionId
      },
      success: function (res) {
        if (res && res.statusCode == 200 && self.globalData.userInfo && JSON.stringify(self.globalData.userInfo) != '{}') {
          typeof cb == "function" && cb();
          self.globalData.isNewUser = false;
          wx.hideLoading()

        } else {
          self.getUserInfo(cb);
        }
      },
      fail: function () {
        self.getUserInfo(cb)
      }
    })
  },
  getUserInfo(cb) {
    var self = this;
    self.globalData.isNewUser = true;
    self.userLogin(cb)
  },
  userLogin(cb) {
    let self = this;

    wx.login({
      success: function (data) {
        // console.log('用户信息0', data)
        wx.getUserInfo({
          success: function (res) {
            // console.log('用户信息', res)
            try {
              wx.setStorageSync('userInfo', res)
            } catch (e) {
               console.log(e)               
            }

            self.globalData.userInfo = res;

            self.fetchSessionId({
              data: {
                "code": data.code,
                "userInfo": res.encryptedData,
                "userInfoIV": res.iv,
                "appId": "wx8f062d58619ebc80"
              },
              cb(data) {
                self.globalData.sessionId = data.token;
                let token = data.token;
                typeof cb == "function" && cb();
                try {
                  wx.setStorageSync('sessionId', token)
                } catch (e) {
                   console.log(e)
                }
              }
            })
          }
        })
      }
    })
  },

  fetchSessionId(params) {
    /*
        code: wx.login返回的code
        userinfo: encryptedData
        userinfo_iv: iv
    */
    wx.request({
      // url: symptomListCfg,
      url: "https://oauth2.rxthinking.com/wx-app/auth",
      data: JSON.stringify(params.data),
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      success: function (res) {
        wx.hideLoading()
        params.cb(res.data)
      }
    })
  },

  globalData: {
    userInfo: null,
    sessionId: '',

    symptomList: {},
    symptomCategory: [],
    selectedSymptom: [],

    inquiryDataList: [],

    userAge: '',
    userGender: '',

    wiki: {
      name: '百科',
      id: '',
      items: []
    },

    diagnoseResult: [
      // {
      //     sn:'',
      //     diagnosis: [],
      //     recall: {
      //         recall: {},
      //         isRecall: false
      //     }
      // }
    ],
    diagnosis: [],
    //by zqy 全局变量id
    drugplansId:'',
    requestTalkId:''
    
  },

  setSymotomList(obj) {
    this.globalData.symptomList = JSON.parse(JSON.stringify(obj));
  },
  setSymptomCategory(obj) {
    this.globalData.symptomCategory = JSON.parse(JSON.stringify(obj));
  },
  setInquiryDataList(obj) {
    this.globalData.inquiryDataList = JSON.parse(JSON.stringify(obj));
  },
  setSelectedSymptom(obj) {
    this.globalData.selectedSymptom = JSON.parse(JSON.stringify(obj));
  },
  setDiagnosis(obj) {
    this.globalData.diagnosis = JSON.parse(JSON.stringify(obj));
  },
  
})