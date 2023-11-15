Page({
  /**
   * 页面的初始数据
   */
  data: {
    SN: '',
    SC: '',
    PID: '',
    wifiName: '',
    wifiPassword: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options;
    this.setData({
      SN: this.options.SN,
      SC: this.options.SC,
      PID: this.options.PID,
      wifiName: this.options.wifiName,
      wifiPassword: this.options.wifiPassword,
    });
  },

  // 连接失败
  onFail() {
    console.log('父组件===连接失败');
    this.redirectFlag = true;
    wx.redirectTo({
      url: `/pages/configTool/deviceResult/fail/index?SN=${this.data.SN}&PID=${this.data.PID}&SC=${this.data.SC}`,
    });
  },
  // 连接成功
  onSuccess() {
    console.log('父组件===连接成功');
    this.redirectFlag = true;
    wx.redirectTo({
      url: `/pages/configTool/linkImou/stepOne/index?SN=${this.data.SN}&PID=${this.data.PID}&SC=${this.data.SC}`,
    });
  },

  onUnload() {
    console.log('页面销毁===onUnload');

    const pages = getCurrentPages();
    console.log(pages, 'pages');
    let index = 0;
    for (let i = 0; i < pages.length; i++) {
      if ('pages/configTool/addDevice/index' === pages[i].route) {
        index = pages.length - i - 2;
        break;
      }
    }
    console.log(index, 'index');
    if (index < 0) index = 0;
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index,
      });
    }
  },
});
