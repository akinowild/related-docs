// pages/configTool/linkImou/inputDeviceSC/index.js

import { GLOBAL_TOKEN, APPID, APPSECRET } from '../../../../utils/config.js';

import { primaryRequest } from '../../../../service/network.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    SC: '',
    nextButtonClick: false,
    password: true,
    passwordUrl:
      'https://festatic.imou.com/webfrontstatic/694da0fd6e3949c2a781ac7d453722fa_20230609/icon_zhebi.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options;
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
  onChangePassword: function (e) {
    this.setData({
      password: !this.data.password,
      passwordUrl: `https://festatic.imou.com/webfrontstatic/694da0fd6e3949c2a781ac7d453722fa_20230609/${
        this.data.password ? 'icon_xianshi' : 'icon_zhebi'
      }.png`,
    });
  },
  onAppSecretInput: function (e) {
    if (e.detail.value) {
      this.setData({
        SC: e.detail.value,
        nextButtonClick: true,
      });
    } else {
      this.setData({
        SC: e.detail.value,
        nextButtonClick: false,
      });
    }
  },
  onBindOpenAccount: function (e) {
    // 这里需要防抖
    primaryRequest({
      url: 'bindDevice',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          token: wx.getStorageSync(GLOBAL_TOKEN),
          deviceId: this.options.SN,
          code: this.data.SC,
        },
      },
      success: (res) => {
        const data = res.data;
        const result = data.result;
        console.log('res', result);
        switch (result.code) {
          // 返回 0 绑定成功，进入 添加成功 界面
          case 'DV1016':
          case 'DV1035':
            wx.showToast({
              title: '密码错误',
              icon: 'none',
            });
            break;
          case '0':
            this.redirectFlag = true;
            wx.redirectTo({
              url: `/pages/configTool/deviceResult/success/index`,
            });
            break;
          default:
            wx.showToast({
              title: result.msg,
              icon: 'none',
            });
            break;
        }
      },
      fail: (res) => {
        console.log('res', '接口调用失败', res);
      },
    });
  },
  onUnload() {
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
