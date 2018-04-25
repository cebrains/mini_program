var app = getApp();

// wx.setNavigationBarColor({
//   frontColor: '#ffffff',
//   backgroundColor: '#ff0000',
//   animation: {
//     duration: 400,
//     timingFunc: 'easeIn'
//   }
// })
Page({
  data: {
    img2Small: {},
    change2Card:{},
    isAfterCard:false,
    change2Bottom:{},
    isDown:false,
    isShowSymptom:false,
    controls: [
      {
        id: 1,
        name: '功能一',
        value: 0,
        max: 200
      }
    ]
  }, 
  onLoad: function () {
    console.log('onLoad')
    var that = this
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 可使用窗口宽度、高度
        console.log('height=' + res.windowHeight);
      }
    })
  },
  onStart(){
      console.log("开始说话.....")
      this.img2SmallFn();
  },
  img2SmallFn(){
    console.log("动画.....")
    var animation = wx.createAnimation({
      duration: 1000,
    })
    animation.width('80rpx').height('80rpx').left('-300rpx').step();
    this.setData({
      img2Small: animation.export()
    }); 
    this.changeCardFn();
    
  },
  changeCardFn(){
    console.log("动画2.....")
    var animation = wx.createAnimation({
      duration: 1000,
    })
    animation.scale(0.6).top('-170rpx').backgroundColor('#fff').step();
    this.setData({
      change2Card: animation.export(),
      isAfterCard:true
    }) 
    this.changeBottomFn()
  },
  changeBottomFn(){
    console.log("动画3.....")
    var animation = wx.createAnimation({
      duration: 1000
    })
    //setTimeout(function(){
    animation.bottom(0).left('30rpx').step();
    this.setData({
      change2Bottom: animation.export(),
      isDown:true
    })
    this.showSymptomBtnFn();
    //}.bind(this),800)
  },
  showSymptomBtnFn(){
    this.setData({
      isShowSymptom:true
    })
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

    if (control.value > control1.max)
      return
    control.value += 0.5;
    this.setData({
      'controls': controls
    })
  },
  // 控制减
  minusCount: function (event) {
    let data = event.currentTarget.dataset;
    let controls = this.data.controls;
    let control = controls.find(function (v) {
      return v.id == data.id
    })
    if (control.value <= 0){
      return
    }     
    control.value -= 1;
    this.setData({
      'controls': controls
    })
  },
  //拖动
  sliderchange: function (e) {
    console.log('slider change，值:', e)
    let data = e.currentTarget.dataset;
    let controls = this.data.controls;
    console.log(data, controls, e.detail.value)
    let control = controls.find(function (v) {
      v.id == data.id
      v.value = e.detail.value
    })
    this.setData({
      'controls': controls
    })
    console.log(controls)
  }

})