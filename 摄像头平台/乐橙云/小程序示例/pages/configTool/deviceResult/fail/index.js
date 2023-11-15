// pages/configTool/deviceResult/fail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad(options) {
    this.options = options
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onUnload() {
    // wx.navigateBack({ delta: this.options.index })
    const pages = getCurrentPages()
    let index = 0
    for (let i = 0; i < pages.length; i++) {
      if ("pages/configTool/addDevice/index" === pages[i].route) {
        index = pages.length - i - 2
        break
      }
    }
    console.log(index, 'index')
    if (index < 0) index = 0
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index
      })
    }
  },
  tryAgain() {
    this.redirectFlag = true
    if(this.options.source){
      wx.redirectTo({
        url: `/pages/configTool/linkImou/stepTwo/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
      });
      return
    }
    // 这里重试 type 存在问题
    const configType = wx.getStorageSync('configType')

    wx.redirectTo({
      url: `/pages/configTool/wifiDataConfig/index?SN=${this.options.SN}&PID=${this.options.PID}&type=${this.options.type}&SC=${this.options.SC}&type=${configType}`
    });
  },
  backToIndex() {
    wx.navigateBack({})
  }
})