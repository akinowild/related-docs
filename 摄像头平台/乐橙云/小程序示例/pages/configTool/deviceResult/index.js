// pages/configTool/deviceResult/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    msg: '该设备已绑定在当前账号下。',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      msg: this.options.msg,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const pages = getCurrentPages();
    let index = 0;
    for (let i = 0; i < pages.length; i++) {
      if ('pages/configTool/addDevice/index' === pages[i].route) {
        index = pages.length - i - 2;
        break;
      }
    }
    if (index < 0) index = 0;
    console.log(index, 'index');
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index,
      });
    }
  },
});
