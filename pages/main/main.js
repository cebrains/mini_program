//inquire.js
import { fetchType } from '../../common/config'
import { startFetch, talkFetch, symptomListFetch, statistics } from '../../common/fetch';
import { handleDialogueSucCb, handleSymptomListFetch } from '../../common/handleFetch';

//获取应用实例
var app = getApp();

Page({
    data: {
        toView: 'dialog0',
        showOptions: false,
        dataList: [],

        // current
        options: [],
        optionType: '',     //当前选项type
        selectOption: 1,
        pickerDefaultValue: [1],     //同selectOption值

        freeTextVal: '',
        showProtocol: false,    //显示用户协议

        // 化验列表
        labModal: false,

        footerHeight: '',
        freeInpDisabled: false,

        // hasDiagnose: false,
        loadingShow: false,
        saveNickModal: false,
        customNickName: '',

        lastSendData: null,
        errorMsg: '',
        showErrorMsg: false,
        networkErr: false,
        //结束问诊 by zqy
        showMask:false,
        showEndFormRight:false,
        plansId:'',
        plansSid:'',
        clickNumber:0,
        changeItem:'',
        currentSexy:'man',
        controls: [
          {
            id: 1,
            name: '年龄',
            value: 36,
            max: 200
          }
          
        ],
        sliderVal:'',
        //生命体征控制显示
        showSignFlag:false,
        inputHeightVal:''
    },

    onLoad(option) {
      console.log('onLoad', option)
        let self = this;
        app.checkUser(function () {
            self.enterPage(option)
        })
    },
    //by zqy navigateBack获取参数 使clickNumber为0 
    onShow(){
      let pages = getCurrentPages(),
          currPage = pages[pages.length - 1];
      if (currPage.data.changeItem === "yes") {
        this.setData({//将携带的参数赋值
          clickNumber: 0
        });
        console.log(this.data.clickNumber)
      }       
    },
    //更改性别
    changeSexyMan(){
      this.setData({
        currentSexy:'man'
      })
    },
    changeSexyWomen() {
      this.setData({
        currentSexy:'women'
      })
    },
    enterPage(option) {
        let { selectedSymptom, lastSendData } = app.globalData,
            { dataList } = this.data,
            self = this;

        if (option.source  && selectedSymptom.length > 0) {
            this.init();
            self.setData({
                loadingShow: true
            })
            self.actionClickFinish('ask-symptoms');
            console.log('60606060', selectedSymptom)

            setTimeout(function () {
                self.talkFetch({ value: selectedSymptom, type: 'symptomList' });
            }, 400)

        } else {
            if (lastSendData && JSON.stringify(lastSendData) != '{}') {
                this.startFetch(lastSendData);
            } else {
                this.setData({
                    dataList: [],
                    toView: 'dialog0'
                });
                this.startFetch();
            }

        }
    },

    init() {
        let { inquiryDataList } = app.globalData,
            len = inquiryDataList.length - 1;
        console.log('init inquiryDataList ', inquiryDataList)

        this.setData({
            dataList: JSON.parse(JSON.stringify(inquiryDataList)),
            toView: 'dialog' + len
        })
        console.log('@1', inquiryDataList)
        console.log('@2', JSON.parse(JSON.stringify(inquiryDataList)))
        return inquiryDataList
    },

    // 调用setData
    draw(params) {
        let { dataList } = this.data,
            _dataList = params.dataList || dataList,
            _len = _dataList.length,
            _lastLi = _dataList[_len - 1],
            { optType, asking } = _lastLi,
            { options } = asking,
            footerH,
            toView;

        if (optType == 'FreeText' || (optType == 'TextOptions' && options.length == 1) || optType == 'AskSymptoms' || optType == 'AskLabItemOptions') {
            footerH = '100rpx'
        } else if (optType == 'SaveOptions') {
            footerH = "202rpx"
        } else {
            footerH = '460rpx'
        }

        if (_lastLi.answer.length > 0) {
            toView = 'dialog' + (_lastLi.sn + 1)
        } else {
            toView = 'dialog' + (_lastLi.sn)
        }

        // console.log('toView : ' + toView);

        let json = Object.assign({}, params, {
            toView,
            footerHeight: footerH
        });
        this.setData(json)
    },

    // 开始问诊fetch
    startFetch(params) {
        console.log(123,params)
        let sessionId = app.globalData.sessionId,
            self = this,
            id, request;

        if (params) {
            id = params.id || '';
            request = params || {};
        }

        startFetch({
            id,
            request,
            sessionId,
            cb(data) {
                self.successCb(data);
            },
            failCb() {
                self.failCb();
            }
        })
    },

    // talk 流
    talkFetch(params) {
        let { dataList } = this.data,
            self = this,
            _dataList = JSON.parse(JSON.stringify(dataList)),
            _len = _dataList.length,
            curLi = _dataList[_len - 1],
            curId = curLi.id,
            curSN = curLi.sn,
            optionType = curLi.optType,
            data;

        this.setData({
            freeInpDisabled: true
        })

        let { resType } = self.setFetchType(optionType),
            input = {
                "@type": resType
            };

        data = {
            "id": curId,
            "sn": parseFloat(curSN) + 1
        };

        if (params.value) {
            if (optionType == 'FreeText') {
                input.text = params.value;
            } else if (optionType == 'TextOptions') {
                input.key = params.value;
            } else if (optionType == 'AskSymptoms') {
                if (params.type == 'symptomList') {
                    input.symptoms = params.value;
                } else if (params.type == 'symptomText') {
                    input.text = params.value;
                }

            } else if (optionType == 'AskLabItemOptions') {
                if (params.type == 'skip') {
                    input.skip = params.value
                } else if (params.type == 'keys') {
                    input.keys = params.value;
                }
            } else if (optionType == 'SaveOptions') {
                input.save = params.save;
                if (params.save) {
                    input.name = params.name;
                }
            } else if (optionType == 'ImageOptions') {
                input.key = params.value
            }

            data.input = input;
        }

        if (params.commands) {
            data.commands = [{
                id: params.commands.id
            }]
        }

        self.sendTalkFetch(data);
    },

    sendTalkFetch(data) {
        let sessionId = app.globalData.sessionId,
            self = this;

        this.setData({
            lastSendData: data
        })

        setTimeout(function () {
            talkFetch({
                sessionId,
                data: data,
                cb(data) {
                    self.successCb(data);
                },
                failCb() {
                    self.failCb();
                }
            })
        }, 400)
    },

    // 请求成功
    successCb(data) {         
        //获取get-doctor-inquiry-diagnosis，则出现结束问诊按钮,否则消失 by zqy
        console.log(data.actions)
        let resCommandId='';
        if (data.actions && data.actions.length > 0) {
          resCommandId = data.actions[0].command.id;
          // if (resCommandId != 'get-doctor-inquiry-diagnosis'){
          //   this.setData({
          //      showEndFormRight: false
          //   })
          // }else{
            this.showFinishBox(resCommandId);
          //}
          
        } else if (data.actions == undefined && resCommandId != 'get-doctor-inquiry-diagnosis'){
          this.setData({
              showEndFormRight: false
          })
        }     
        let self = this,
            { dataList } = this.data,
            _dataList = JSON.parse(JSON.stringify(dataList)),
            { _list, _options, age, gender, _diseaseResult, _askName } = handleDialogueSucCb(data),
            _type = _list.optType,
            _labModal = false,
            askName = false;
        // console.log(data.actions);
        // console.log(_dataList, dataList)
        app.globalData.conversationId = data.id;
        if (age && gender) {
            app.globalData.userAge = age;
            app.globalData.userGender = gender;
        }

        _dataList.push(_list);

        if (_type == 'FreeText' || _type == 'AskSymptoms') {     //自由输入
            _options = _list.asking.watermark
        } else if (_type == 'AskLabItemOptions') {    //化验列表
            _labModal = true;
        } else if (_type == 'SaveOptions') {
            // _diseases && (app.globalData.diagnosis = _diseases);
            // _recall && (app.globalData.recall = _recall);
            _diseaseResult && (app.globalData.diagnoseResult.push(_diseaseResult));
            askName = _askName;

            try {
                wx.reportAnalytics('message_diagnosis', {
                    text: JSON.stringify(_diseaseResult),
                });
                statistics({
                    options: [
                        '$event=message_diagnosis', '$app=wx-app-doctor'
                    ],
                    sessionId: app.globalData.sessionId
                })
            } catch (e) { console.log(e) }
        }

        self.draw({
            dataList: _dataList,
            options: _options,
            optionType: _type,
            labModal: _labModal,
            loadingShow: false,
            askName: askName,
            networkErr: false,
            freeInpDisabled: false,
            freeTextVal:'',

            pickerDefaultValue: [1],
            selectOption: 1
        })

        
    },

    // 请求失败
    failCb() {
        let self = this;
        self.setData({
            loadingShow: false,
            errorMsg: '网络不可用,请稍后再试',
            showErrorMsg: true,
            networkErr: true,
            freeInpDisabled: false
        })
        setTimeout(function () {
            self.setData({
                showErrorMsg: false
            })
        }, 3000);
    },

    // 重新发送
    reSend() {
        let { lastSendData } = this.data,
            self = this;
        wx.showModal({
            content: '是否重新发送消息',
            success: function (res) {
                if (res.confirm) {
                    self.sendTalkFetch(lastSendData);
                }
            }
        })
    },

    loadingHide() {
        this.setData({
            loadingShow: false
        })
    },

    // 同意用户服务协议
    agreeProtocol() {
        this.draw({
            showProtocol: false
        })
    },
    //判断是否出现get-doctor-inquiry-diagnosis by zqy
    showFinishBox(commandid){
      if (commandid === 'get-doctor-inquiry-diagnosis') {    //出现结束问诊浮层
        this.setData({
          showEndFormRight: true
        })             
      } else {
        this.setData({
          showEndFormRight: false
        })
      }
    },
    //获取用户指令（action）
    clickCommand(e) {      
        let { commandid, type, finish,text } = e.currentTarget.dataset,
            { dataList } = this.data,
            self = this;
        if (finish) return;
        //by zqy add choose click +=1
        if (commandid == 'ask-symptoms') {
          self.data.clickNumber += 1;
        }
        console.log(self.data.clickNumber)
        self.actionClickFinish(commandid)       
        
        if (commandid == 'start-doctor-inquiry') {
          app.setSymotomList({});
          app.setSymptomCategory([]);
          app.setInquiryDataList([]);
          app.setSelectedSymptom([]);


          if (!commandid) return;
          self.showLoading();
          this.recordUserInp([{ value: text, type: 'text' }])

          try {   //开始问诊 按钮 【支持自有运营平台】
            wx.reportAnalytics('click_begin_consult', {});
            statistics({
              options: [
                '$event=click_begin_consult', '$app=wx-app-doctor'
              ],
              sessionId: app.globalData.sessionId
            })
          } catch (e) { console.log(e) }


          setTimeout(function () {
            self.talkFetch({
              commands: {
                id: commandid
              }
            })
          }, 400)

        } else if (commandid == 'show-doctor-inquiry-history') {     //跳转到问诊记录列表

          try {   //查问诊记录按钮 【支持自有运营平台】
            wx.reportAnalytics('click_enter_record', {});
            statistics({
              options: [
                '$event=click_enter_record', '$app=wx-app-doctor'
              ],
              sessionId: app.globalData.sessionId
            })
          } catch (e) { console.log(e) }
          wx.navigateTo({
            url: "/pages/records/records",
          });

        } else if (commandid == 'ask-symptoms' && self.data.clickNumber==1) {     //跳转到症状列表 edit by zqy
          app.setInquiryDataList(dataList)
          self.getSymptomList();

        } else if (commandid == 'more') {    //查看更多
          self.draw({
            showProtocol: true,
            loadingShow: false
          })
        }      
        
    },

    actionClickFinish(commandid) {    
        if ((commandid == 'ask-symptoms' && app.globalData.selectedSymptom.length == 0) || commandid == 'show-doctor-inquiry-history') {
          console.log('actionClickFinish  405',commandid)
            return;
        } 
        this.disabledAction();       
    },

    disabledAction() {
        let { dataList } = this.data;
        let _dataList = JSON.parse(JSON.stringify(dataList)),
            _len = _dataList.length,
            _curLi = _dataList[_len - 1],
            _curStemsArr = _curLi.stems;

        for (let i = 0; i < _curStemsArr.length; i++) {
            if (_curStemsArr[i].action && !_curStemsArr[i].finish) {
                _curStemsArr[i].finish = true;
            }
        }

        this.draw({
            dataList: _dataList
        })
    },

    // 两个选项 --> 保存记录
    clickTwoOpt(e) {
        let { key } = e.currentTarget.dataset,
            { askName } = this.data,
            self = this;
        if (key == 'save') {

            try {
                wx.reportAnalytics('click_save_record');
                // statistics({
                //     options: [
                //         '$event=click_save_record', '$app=wx-app-doctor'
                //     ],
                //     sessionId: app.globalData.sessionId
                // })

            } catch (e) { console.log(e) };


            if (askName) {
                self.setData({
                    saveNickModal: true
                })
            }
            else {
                self.talkFetch({ value: 'saveOption', save: true });
            }

        } else if (key == 'noSave') {

            try {
                wx.reportAnalytics('click_no_save_record')

            } catch (e) { console.log(e) };
            self.showLoading()
            self.talkFetch({ value: 'saveOption', save: false });
        }
    },

    // 记录用户输入
    recordUserInp(params) {
        let self = this,
            { options, dataList, optionType } = this.data,
            _dataList = JSON.parse(JSON.stringify(dataList)),
            _len = _dataList.length,
            _curLi = _dataList[_len - 1];

        _curLi.answer = params;
        // this.showLoading();

        this.draw({
            dataList: _dataList
        })
    },

    showLoading() {
        this.setData({
            loadingShow: true
        })
    },
    // 设置请求的@type
    setFetchType(type) {
        let resType = '',
            optType = '';

        for (let i = 0; i < fetchType.length; i++) {
            if (type == fetchType[i].type) {
                resType = fetchType[i].res || fetchType[i].req;
                break;
            }
        }
        return { resType };
    },

    // 点击单个选项
    clickSingleOpt(e) {
        let self = this,
            { key, text, commandId } = e.currentTarget.dataset;

        this.agreeProtocol();

        if (!key) return;
        self.showLoading();
        this.actionClickFinish(commandId);
        console.log('commandId', commandId)
        this.recordUserInp([{ value: text, type: 'text' }]);
        self.talkFetch({ value: key });
    },

    // 确定自由文本
    sendFreeText() {
        let self = this,
            { freeTextVal } = this.data;
        if (freeTextVal == '') { return };

        if (!freeTextVal) return;

        self.showLoading();

        try {
            wx.reportAnalytics('click_sent_text', {
                text: freeTextVal
            });
            statistics({
                options: [
                    '$event=click_sent_text', 'text=' + encodeURI(freeTextVal), '$app=wx-app-doctor'
                ],
                sessionId: app.globalData.sessionId
            })

        } catch (e) { console.log(e) }

		    //this.disasurePickerbledAction();
        this.recordUserInp([{ value: freeTextVal, type: 'text' }])
        this.talkFetch({ value: freeTextVal, type: 'symptomText' })

    },

    // 记录自由文本输入
    recordFreeText(e) {
        let value = e.detail.value;
        this.draw({
            freeTextVal: value
        })
    },
    // picker
    pickerChange(e) {
        const val = e.detail.value
        // this.selectOption = val[0]
        this.setData({
            selectOption: val[0]
        })
    },

    // 确定picker输入
    surePicker() {
        let self = this;

        self.showLoading();

        setTimeout(function () {
            let { selectOption, options } = self.data,
                val = options[selectOption];

            if (!val.key) return;
            self.recordUserInp([{ value: val.text, type: 'text' }])
            setTimeout(function () {
                self.talkFetch({ value: val.key });
            }, 400)
        }, 600)


    },

    //scrollVeiw横向滚动
    scrollViewRadioChange(e) {
        const checked = e.detail.value;
        this.radioChangeFunc(checked)
    },
    scrollViewClickImg(e) {
        const { key } = e.currentTarget.dataset;
        this.radioChangeFunc(key)

    },
    radioChangeFunc(checked) {
        let { options } = this.data;

        let _options = JSON.parse(JSON.stringify(options)),
            _optLen = _options.length;

        for (let i = 0; i < _optLen; i++) {
            if (_options[i].key == checked) {
                _options[i].checked = true;
            } else {
                _options[i].checked = false;
            }
        }

        this.draw({ options: _options })
    },

    // 确定横向滚动输入
    sureScroll() {
        const { options } = this.data,
            len = options.length,
            self = this;

        let key = '',
            idx;

        for (let i = 0; i < len; i++) {
            if (options[i].checked) {
                key = options[i].key;
                idx = i;
                break;
            }
        }

        if (!key) return;
        self.showLoading();
        this.recordUserInp([{ value: options[idx], type: 'image' }])
        setTimeout(function () {
            self.talkFetch({ value: key });
        }, 400)

    },

    //获取症状列表数据
    getSymptomList() {
        let self = this;
        let age = app.globalData.userAge,
            gender = app.globalData.userGender;

        symptomListFetch({
            age: age,
            gender: gender,
            sessionId: app.globalData.sessionId,
            cb(data) {
                let { _list, _sort } = handleSymptomListFetch(data);
                app.setSymotomList(_list);
                app.setSymptomCategory(_sort);

                wx.navigateTo({
                    url: '/pages/symptom/symptom',
                    success() {
                        self.setData({
                            optSymptoms: false
                        })
                    }
                })               
            }
        })
    },

    //化验列表
    labOptsChange(e) {
        let { idx, answer } = e.currentTarget.dataset,
            { value } = e.detail,
            { options } = this.data,
            _options = JSON.parse(JSON.stringify(options)),
            curOpt = _options[idx];

        for (let i = 0; i < curOpt.options.length; i++) {
            if (curOpt.options[i].key == value) {
                curOpt.selectedKey = value;
                curOpt.selectedAnswer = curOpt.options[i].answer;
            }
        }

        this.setData({
            options: _options
        })

    },
    cancelLab() {     //未做过以上化验

        // try {
        //     statistics({
        //         options: [
        //             '$event=click_inspect_cancel', '$app=wx-app-doctor'
        //         ],
        //         sessionId: app.globalData.sessionId
        //     })
        // } catch (e) { console.log(e) }

        this.talkFetch({ value: true, type: 'skip' });
    },

    sureLab() {      //确认化验输入
        let { options } = this.data,
            _arr = [],
            _answer = [],
            self = this;

        // try {
        //     statistics({
        //         options: [
        //             '$event=click_inspect_submit', '$app=wx-app-doctor'
        //         ],
        //         sessionId: app.globalData.sessionId
        //     })
        // } catch (e) { console.log(e) }


        options.map(val => {
            if (val.selectedKey) {
                _arr.push(val.selectedKey);
                _answer.push({ value: val.selectedAnswer, type: 'text' });
            } else {
                _arr.push(val.options[val.options.length - 1].key)
            }

        })

        if (!_arr) return;
        self.showLoading();
        this.recordUserInp(_answer)
        setTimeout(function () {
            self.talkFetch({ value: _arr, type: 'keys' });
        }, 400)
    },

    // 设置昵称
    sureNickname(e) {
        let { value } = e.detail;
        this.setData({
            customNickName: value
        })
    },
    // 取消保存nick
    cancelSaveResult() {
        this.setData({
            saveNickModal: false
        })
    },
    // 保存问诊记录（已设置昵称）
    clickSureSaveResult() {
        let { customNickName } = this.data,
            self = this;
        self.cancelSaveResult();
        if (customNickName != '') {
            self.talkFetch({ value: 'saveOption', save: true, name: customNickName });
        } else {
            self.talkFetch({ value: 'saveOption', save: true });
        }
    },

    //进入疾病列表
    clickDiagnoseCard(e) {
        let { sn } = e.currentTarget.dataset;
        console.log('1111111111',e.currentTarget.dataset);
        try {
            statistics({
                options: [
                    '$event=click_diagnose_list', '$app=wx-app-doctor'
                ],
                sessionId: app.globalData.sessionId
            })
        } catch (e) { console.log(e) }

        wx.navigateTo({
            url: '/pages/reportList/reportList?idx=' + sn,
        })
    },

    // 反馈
    clickFreeBackBtn(e) {
        wx.navigateTo({
            url: '/pages/feedback/feedback',
        })
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: '大数健康测评',
            path: "pages/inquiry/inquiry"
        }
    },
    //点击右侧结束问诊出现弹框
    showMaskEndInquiry(){
    		this.setData({
            showMask: true
        })
    },
    //点击取消 by zqy
     cancelEndInquiry(){
    		this.setData({
            showMask:false,
            showEndFormRight:false
        })
    },
    //点击结束问诊 
     EndInquiry(){
       //遮罩层消失并到本页面的诊断结果
       this.setData({
         showMask: false
       })
       let self = this;
       //setTimeout(function () {
         console.log(12345)
         self.talkFetch({
           commands: {
             id: 'get-doctor-inquiry-diagnosis'
           }
         })
       //}, 400);
       
    },
    //点击用药方案 获取ID 并跳转页面
    clickTodrugPlans(e){
      app.drugplansId = e.currentTarget.dataset.id;
      let title_name = e.currentTarget.dataset.name;
      wx.navigateTo({
        url: "/pages/drugScheme/drugScheme?name="+title_name
      });
    },
    //点击robot 出现基本信息、生命特诊等遮罩层   
    showMaskFromBottom() {
      //基本信息
      //essentialInfo

    },
    // 控制加
    addCount: function (event) {
      let data = event.currentTarget.dataset
      let controls = this.data.controls
      let control = controls.find(function (v) {
        return v.id == data.id
      })
      let control1 = controls.find(function (v) {
        return v.max == data.max
      })

      if (control.value >= control1.max)
        return
      control.value += 1;
      console.log(control.value)
      this.setData({
        'controls': controls,
        'sliderVal': control.value
      })
    },
    // 控制减
    minusCount: function (event) {
      let data = event.currentTarget.dataset;
      let controls = this.data.controls;
      let control = controls.find(function (v) {
        return v.id == data.id
      })
      if (control.value <= 0) {
        return
      }
      control.value -= 1;
      console.log(control.value)
      this.setData({
        'controls': controls,
        sliderVal:control.value
      })
    },
    //拖动
    sliderchange: function (e) {
      console.log('slider change，值:', e.detail.value)
      this.setData({
        'sliderVal':e.detail.value
      })
      let data = e.currentTarget.dataset;
      let controls = this.data.controls;
      let control = controls.find(function (v) {
        v.id == data.id
        v.value = e.detail.value
      })
      this.setData({
        'controls': controls
      })
      console.log(controls)
    },
    showHeightSign(e){
      this.setData({
        showSignFlag:true
      })
      console.log(this.data.inputHeightVal)
    },
    hideHeightSign(e){
      this.setData({
        showSignFlag: false,
        inputHeightVal:''
      })
    }
})
