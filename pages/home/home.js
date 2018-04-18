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
    isShowSymptom:false
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
  }

})