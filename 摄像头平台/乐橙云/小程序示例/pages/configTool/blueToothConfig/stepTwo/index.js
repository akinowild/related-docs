Page({
  /**
   * 页面的初始数据
   */
  data: {
    showActionSheet: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options;
  },
  onBindOpenAccount: function (e) {
    wx.redirectTo({
      url: `/pages/configTool/blueToothConfig/stepThree/index?SN=${this.options.SN}&PID=${this.options.PID}&wifiName=${this.options.wifiName}&wifiPassword=${this.options.wifiPassword}&SC=${this.options.SC}`,
    });
  },
  onShowHelpMessage: function (e) {
    this.setData({
      showActionSheet: true,
    });
  },
  onCloseHelpMessage: function (e) {
    this.setData({
      showActionSheet: false,
    });
  },
});
