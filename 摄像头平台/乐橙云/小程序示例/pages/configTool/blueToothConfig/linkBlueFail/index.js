// pages/configTool/blueToothConfig/linkBlueFail/index.js
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const pages = getCurrentPages()
    console.log(pages, 'pages')
    let index = 0
    for (let i = 0; i < pages.length; i++) {
      if ("pages/configTool/addDevice/index" === pages[i].route) {
        index = pages.length - i - 2
        break
      }
    }
    if (index < 0) index = 0
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index
      })
    }
  },
  tryAgain() {
    this.redirectFlag = true
    wx.redirectTo({
      url: `/pages/configTool/blueToothConfig/stepThree/index?SN=${this.options.SN}&PID=${this.options.PID}&wifiName=${this.options.wifiName}&wifiPassword=${this.options.wifiPassword}&SC=${this.options.SC}`
    });
  },
  backToIndex() {
    wx.navigateBack({})
  }
})