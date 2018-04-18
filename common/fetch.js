import {
    cfg,
    start,
    talk,
    close,

    statisticCfg,
    statisticUrl,

    symptomListCfg,
    symptomSuggest,
    symptomCategoryCfg,
    wikiCfg,

    inquiryRecord,
    recordList,
    saveRecord,
    feedBack,
    drugUsagePlans
} from './config'

module.exports = {
    startFetch: startFetch,
    talkFetch: talkFetch,

    symptomListFetch: symptomListFetch,
    symptomSearchFetch: symptomSearchFetch,
    // symptomCategoryFetch: symptomCategoryFetch,
    wikiFetch: wikiFetch,
    recordsListFetch: recordsListFetch,
    inquiryRecordFetch: inquiryRecordFetch,
    feedBackFetch: feedBackFetch,

    statistics: statistics,
    //by zqy
    drugPlansFetch: drugPlansFetch
}

// start
function startFetch(params) {
    let data = {
        id: params.id || '',
        request: params.request || {}
    };

    wx.request({
        url: cfg + start,
        data: JSON.stringify(data),
        method: "POST",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.statusCode == 200) {
                if (res.data) {
                    params.cb(res.data)
                }
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

// talk
function talkFetch(params) {
    wx.request({
        url: cfg + talk,
        data: JSON.stringify(params.data),
        method: "POST",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.statusCode == 200) {
                if (res.data) {
                    params.cb(res.data)
                }
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

//请求症状列表
function symptomListFetch(params) {
    /*
        搜索时，params添加：
            type（=search表述搜索）
            text（搜索的内容）
    */
    let { age, gender, type, text, cb, sessionId } = params;
    // let data = getBasic({ age, gender, });

    let opt = "?start=0&count=2000&options.UserPatient=UserPatient&options.gender=" + gender + "&options.age.year=" + age;

    wx.request({
        // url: symptomListCfg,
        url: cfg + symptomListCfg + opt,
        data: '{}',
        method: "GET",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + sessionId
        },
        success: function (res) {
            if (res.statusCode == 200) {
                if (wx.hideLoading) {
                    wx.hideLoading()
                }

                if (res.data) {
                    cb(res.data)
                }
            }

        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

//症状搜索
function symptomSearchFetch(params) {
    let { age, gender, type, text, cb, sessionId } = params;
    // let data = getBasic({ age, gender, type:'search' });

    let opt = "?count=10&text=" + text + "&options.UserPatient=UserDoctor" + "&options.gender=" + gender + "&options.age.year=" + age;

    wx.request({
        url: cfg + symptomSuggest + opt,
        data: '{}',
        method: "GET",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + sessionId
        },
        success: function (res) {
            if (res.statusCode == 200) {
                if (wx.hideLoading) {
                    wx.hideLoading()
                }

                if (res.data) {
                    cb(res.data)
                }
            }

        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

function getBasic(params) {
    let { age, gender, type, text } = params;
    let data = {
        options: {
            "userType": "UserPatient",
            "gender": gender,
            "age": {
                "year": age
            }
        }
    }
    data.count = 1000;
    // data.size = 1000;
    if (type && type == 'search') {
        data.text = text;
        data.start = 0;
        // data.size = 10
        data.count = 10
    }
    return data;
}


//百科
function wikiFetch(params) {
    wx.request({
        url: cfg + wikiCfg,
        data: { type: 'disease', id: params.id },
        method: "GET",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.data && res.statusCode == 200) {
                params.cb(res.data, params.id)
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}


//获取历史问诊记录列表
function recordsListFetch(params) {
    wx.request({
        url: cfg + recordList,
        data: params.data,
        method: "GET",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.data) {
                params.cb(res.data, params.id)
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

//获取记录详情（get）|| 删除单条记录（delete）
function inquiryRecordFetch(params) {
    wx.request({
        url: cfg + inquiryRecord + params.id,
        data: params.data,
        method: params.method,
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.data) {
                params.cb(res.data)
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

//反馈
function feedBackFetch(params) {
    wx.request({
        url: cfg + feedBack,
        data: params.data,
        method: 'POST',
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.data) {
                params.cb(res.data)
            }
        },
        fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
    })
}

function fetchFail() {
    wx.hideLoading();
    wx.showModal({
        content: '网络不可用,请稍后再试',
        showCancel: false,
        success: function () {

        }
    })
}


function statistics(params) {
    let {options}=params,
        str='';

    str += '?' + options.join('&');
    wx.request({
        url: statisticCfg + statisticUrl + str,
        method: "GET",
        header: {
            "content-type": "application/json; charset=UTF-8",
            "Authorization": 'bearer ' + params.sessionId
        },
        success: function (res) {
            if (res.data && res.statusCode == 200) {
                console.log('send success!')
            }
        }
    })
}
//获取药品方案 by zqy  根据药品方案的ID, 获取方案对应的药品信息
function drugPlansFetch(params) {
  wx.request({
    url: cfg + drugUsagePlans,
    data: params.data,
    method: 'POST',
    header: {
      "content-type": "application/json; charset=UTF-8",
      "Authorization": 'bearer ' + params.sessionId
    },
    success: function (res) {
      if (res.data) {
        params.cb(res.data)
      }
    },
    fail: typeof params.failCb == 'function' ? params.failCb : fetchFail
  })
}
