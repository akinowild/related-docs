// pages/configTool/blueToothConfig/stepOne/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options
    
  },
  onBindOpenAccount(){
    wx.navigateTo({
      url: `/pages/configTool/blueToothConfig/stepTwo/index?SN=${this.options.SN}&PID=${this.options.PID}&wifiName=${this.options.wifiName}&wifiPassword=${this.options.wifiPassword}&SC=${this.options.SC}&index=${this.options.index + 1}`
    });
  },
})