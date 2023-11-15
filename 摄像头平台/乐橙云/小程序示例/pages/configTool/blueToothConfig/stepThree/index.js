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
    // 这里进行 蓝牙配网的自执行逻辑
    this.setData({
      SN: this.options.SN,
      SC: this.options.SC,
      PID: this.options.PID,
      wifiName: this.options.wifiName,
      wifiPassword: this.options.wifiPassword,
    });
  },
  onReady() {
    wx.enableAlertBeforeUnload({
      message:
        '设备添加尚未完成。如果退出，您将需要重新开始添加流程。是否退出？',
      success(res) {
        console.log('success:', res);
      },
      fail(res) {
        console.log('fail:', res);
      },
      complete(res) {
        console.log('complete:', res);
      },
    });
  },
  // 连接失败
  onFail() {
    console.log('父组件===蓝牙连接失败');
    wx.disableAlertBeforeUnload();
    this.redirectFlag = true;
    wx.redirectTo({
      url: `/pages/configTool/blueToothConfig/linkBlueFail/index?SN=${this.data.SN}&PID=${this.data.PID}&wifiName=${this.data.wifiName}&wifiPassword=${this.data.wifiPassword}&SC=${this.data.SC}`,
    });
  },
  // 连接成功
  onSuccess() {
    console.log('父组件===已连接蓝牙设备');
    wx.disableAlertBeforeUnload();
    this.redirectFlag = true;
    wx.redirectTo({
      url: `/pages/configTool/linkImou/stepOne/index?SN=${this.data.SN}&PID=${this.data.PID}&SC=${this.data.SC}`,
    });
  },
  onUnload() {
    console.log('Page---onUnload');
    const pages = getCurrentPages();
    console.log(pages, 'pages');
    let index = 0;
    for (let i = 0; i < pages.length; i++) {
      if ('pages/configTool/addDevice/index' === pages[i].route) {
        index = pages.length - i - 2;
        break;
      }
    }
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index,
      });
    }
  },
});
