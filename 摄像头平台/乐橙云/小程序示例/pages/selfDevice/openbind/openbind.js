import {  getAccessToken} from '../../../service/userservice.js'

import {
  GLOBAL_TOKEN,
  GLOBAL_STATUSOPENBIND,
  APPID,
  APPSECRET
} from '../../../utils/config.js'


// pages/openbind/openbind.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appid: '',
    appsecret: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ appid: wx.getStorageSync(APPID) || 'lc2ab0d025ca614d40' , appsecret: wx.getStorageSync(APPSECRET) || 'acd3ad04691d4f7aa6c54d1e2abfac' })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },

  onBindOpenAccount: function () {
    let appid = this.data.appid
    let appsecret = this.data.appsecret
    if (appid == '') {
      wx.showToast({
        title: '请输入合法的appId',
        mask: true,
        icon: 'none'
      })
      return false
    }
    if (appsecret == '') {
      wx.showToast({
        title: '请输入合法的appSecret',
        mask: true,
        icon: 'none',
      })
      return false
    }
    //开发者账户登录验证
    getAccessToken(this.data.appid, this.data.appsecret).then(({result}) =>{
        if (result.code == 0) {
          wx.showToast({
            title: 'result.code == 0',
            mask: true,
            icon: 'none',
            duration:'3000'
          })
        console.log('获取accesstoken成功')
        //将accessToken和登录状态保存在小程序本地
        wx.setStorageSync(GLOBAL_TOKEN, result.data.accessToken)
        wx.setStorageSync(GLOBAL_STATUSOPENBIND, true)
        wx.setStorageSync(APPID, this.data.appid)
        wx.setStorageSync(APPSECRET, this.data.appsecret)
        // 跳转回视频列表页面
        wx.redirectTo({
          url: '/pages/selfDevice/video/video',
        })
      } else {
        wx.showToast({
          title: result.msg,
          mask: true,
          icon: 'none',
        })
      }
    }).catch(err =>{
      console.error(err)
    })
  },
  onAppIdInput: function (e) {
    console.log(e.detail)
    this.setData({
      appid: e.detail.value
    })
  },
  onAppSecretInput: function (e) {
    this.setData({
      appsecret: e.detail.value
    })
  },

})