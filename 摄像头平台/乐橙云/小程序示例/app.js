const util = require('./utils/util.js');
const updateVersion = require('./utils/updateManager.js');


//app.js
App({
  onLaunch: function () {
    this.checkWxUserInfo()
    updateVersion();
    this.$showModal = util.showModal;
    this.$getDomStyle = util.getDomStyle;
  },

  onError(err) {
    console.log('Error: ', err);
  },

  globalData: {
    userInfo: null,
    token: '', //session token
    statusOpenBind: false, //开发者账号是否已经登录
    wxUserInfo: null, //微信授权后的scope信息
    statusScopeUser: null, //是否已经微信授权
    appId: null, //乐橙开放平台开发者appid
    appSecret: null, //乐橙开放平台开发者appsecret
    videoListRefresh:true//默认每次点击”我的视频“都刷新设备列表页面，除了从视频播放页面返回不刷新
  },
  checkWxUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          this.globalData.statusScopeUser = true
          console.log("微信用户已经授权")
        } else {
          this.globalData.statusScopeUser = false
          console.log("微信用户未经授权")
        }
        if (this.wxUserScopeReadyCallback) {
          this.wxUserScopeReadyCallback(res)
        }
      }
    })
  }
})