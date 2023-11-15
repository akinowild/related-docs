Page({
  /**
   * 页面的初始数据
   */
  data: {},

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
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // wx.navigateBack({ delta: this.options.index })
    const pages = getCurrentPages();
    console.log('pages', pages);
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
  backToIndex() {
    // 触发 onload 事件
    wx.navigateBack();
  },
});
