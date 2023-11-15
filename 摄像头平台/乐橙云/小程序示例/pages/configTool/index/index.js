import {
  getAccessToken
} from '../../../service/userservice.js'

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
    buttonCanClick: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const appid = wx.getStorageSync(APPID)
    const appsecret = wx.getStorageSync(APPSECRET)
    let buttonCanClick = false
    if (appid && appsecret) {
      buttonCanClick = true
    }
    this.setData({
      appid,
      appsecret,
      buttonCanClick
    })
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
    getAccessToken(this.data.appid, this.data.appsecret).then(({
      result
    }) => {
      if (result.code == 0) {
        wx.showToast({
          title: 'result.code == 0',
          mask: true,
          icon: 'none',
          duration: '3000'
        })
        console.log('获取accesstoken成功')
        //将accessToken和登录状态保存在小程序本地
        wx.setStorageSync(GLOBAL_TOKEN, result.data.accessToken)
        wx.setStorageSync(GLOBAL_STATUSOPENBIND, true)
        wx.setStorageSync(APPID, this.data.appid)
        wx.setStorageSync(APPSECRET, this.data.appsecret)
        // 跳转回视频列表页面
        wx.redirectTo({
          url: '/pages/configTool/addDevice/index',
        })
      } else {
        wx.showToast({
          title: result.msg,
          mask: true,
          icon: 'none',
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  onAppIdInput: function (e) {
    console.log(e.detail)
    if (e.detail.value && this.data.appsecret)
      this.setData({
        appid: e.detail.value,
        buttonCanClick: true
      })
    else {
      this.setData({
        appid: e.detail.value,
        buttonCanClick: false
      })
    }
  },
  onAppSecretInput: function (e) {
    if (e.detail.value && this.data.appid) {
      this.setData({
        appsecret: e.detail.value,
        buttonCanClick: true
      })
    } else {
      this.setData({
        appsecret: e.detail.value,
        buttonCanClick: false
      })
    }
  },

})