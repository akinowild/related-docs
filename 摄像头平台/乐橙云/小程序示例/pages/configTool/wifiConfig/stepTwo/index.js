// pages/configTool/blueToothConfig/stopTwo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showActionSheet:false
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onShowHelpMessage:function(e){
    this.setData({
      showActionSheet:true
    })
  },
  onCloseHelpMessage:function(e){
    this.setData({
      showActionSheet:false
    })
  },
  onBindOpenAccount(){
    wx.navigateTo({
      url: `/pages/configTool/wifiConfig/stepThree/index?SN=${this.options.SN}&PID=${this.options.PID}&wifiName=${this.options.wifiName}&wifiPassword=${this.options.wifiPassword}&SC=${this.options.SC}`
    });
  },
})