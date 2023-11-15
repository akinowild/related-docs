Page({
  /**
   * 页面的初始数据
   */
  data: {
    wifiName: '',
    wifiPassword: '',
    password: true,
    passwordUrl:
      'https://festatic.imou.com/webfrontstatic/694da0fd6e3949c2a781ac7d453722fa_20230609/icon_zhebi.png',
    rememberRadio: false,
    showActionSheet: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.options = options;
    // 需要获取此时设备的wifi名称
    wx.startWifi({
      success: (res) => {
        console.log(res.errMsg);
        wx.getConnectedWifi({
          success: (res) => {
            const wifiName = res.wifi.SSID;
            this.setData({
              wifiName: wifiName,
            });
            // 获取对应配置数据
            try {
              let storageData = JSON.parse(wx.getStorageSync('wifi&password'));
              // 校验wifi名称之后，写入 wifi 密码
              if (storageData.wifiName === wifiName) {
                this.setData({
                  wifiPassword: storageData.wifiPassword,
                });
              }
              this.setData({
                rememberRadio: storageData.rememberRadio,
              });
            } catch (err) {
              console.log('err', err);
            }
            // 关闭wifi模块
            wx.stopWifi();
          },
          fail: (res) => {
            if (res.errCode === 12012) {
              if (res.errno === 1505004) {
                wx.showToast({
                  title: '获取wifi信息失败，请打开微信的位置权限',
                  duration: 3000,
                  icon: 'none',
                });
              }
            }
          },
        });
      },
    });
  },
  onShow: function () {
    // 需要获取此时设备的wifi名称
    wx.startWifi({
      success: (res) => {
        console.log(res.errMsg);
        wx.getConnectedWifi({
          success: (res) => {
            const wifiName = res.wifi.SSID;
            this.setData({
              wifiName: wifiName,
            });
            // 获取对应配置数据
            let storageData = JSON.parse(wx.getStorageSync('wifi&password'));
            // 校验wifi名称之后，写入 wifi 密码
            this.setData({
              wifiPassword:
                storageData.wifiName === wifiName
                  ? storageData.wifiPassword
                  : '',
              rememberRadio: storageData.rememberRadio,
            });
            // 关闭wifi模块
            wx.stopWifi();
          },
        });
      },
    });
  },
  onRememberChange: function (data) {
    this.setData({
      rememberRadio: !this.data.rememberRadio,
    });
  },
  onBindOpenAccount: function () {
    let appid = this.data.wifiName;
    let appsecret = this.data.wifiPassword;
    if (appid == '') {
      wx.showToast({
        title: '请输入wifi名称',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    if (appsecret == '') {
      wx.showToast({
        title: '请输入wifi密码',
        mask: true,
        icon: 'none',
      });
      return false;
    }

    const data = {
      wifiName: this.data.wifiName,
      wifiPassword: this.data.wifiPassword,
      rememberRadio: this.data.rememberRadio,
    };
    // 写入 storage 缓存中
    if (this.data.rememberRadio) {
      wx.setStorageSync('wifi&password', JSON.stringify(data));
    } else {
      wx.setStorageSync('wifi&password', JSON.stringify({}));
    }
    if (this.options.type === 'wifi') {
      wx.navigateTo({
        url: `/pages/configTool/wifiConfig/stepOne/index?SN=${
          this.options.SN
        }&PID=${
          this.options.PID
        }&wifiName=${appid}&wifiPassword=${appsecret}&SC=${
          this.options.SC
        }&index=${this.options.index + 1}`,
      });
      return;
    }
    if (this.options.type === 'bluetooth') {
      wx.navigateTo({
        url: `/pages/configTool/blueToothConfig/stepOne/index?SN=${this.options.SN}&PID=${this.options.PID}&wifiName=${appid}&wifiPassword=${appsecret}&SC=${this.options.SC}`,
      });
    }
  },
  onAppIdInput: function (e) {
    this.setData({
      wifiName: e.detail.value,
    });
  },
  onAppSecretInput: function (e) {
    this.setData({
      wifiPassword: e.detail.value,
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
  onShowToast: function (e) {
    wx.showModal({
      title: '切换WiFi',
      content: '请到手机“设置”中切换WiFi',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#337FFF',
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
