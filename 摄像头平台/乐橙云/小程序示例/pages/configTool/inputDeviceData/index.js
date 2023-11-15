import { GLOBAL_TOKEN, APPID, APPSECRET } from '../../../utils/config.js';
import { primaryRequest } from '../../../service/network.js';

// pages/openbind/openbind.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appid: '',
    appsecret: '',
    PID: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.options = options;
  },
  onAppIdInput: function (e) {
    console.log(e.detail);
    this.setData({
      appid: e.detail.value,
    });
  },
  onAppSecretInput: function (e) {
    this.setData({
      appsecret: e.detail.value,
    });
  },
  onBindOpenAccount: function () {
    let SN = this.data.appid;
    let SC = this.data.appsecret;
    if (SN == '') {
      wx.showToast({
        title: '请输入设备序列号',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    const jsonResult = {
      SN,
      SC,
    };
    // 调用接口 获取信息 unbindDeivceInfo
    this.onAddDevice(jsonResult);
  },

  onAddDevice(jsonResult) {
    // 调用接口 获取信息 unbindDeivceInfo
    primaryRequest({
      url: 'unBindDeviceInfo',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          token: wx.getStorageSync(GLOBAL_TOKEN),
          deviceId: jsonResult.SN,
        },
      },
      success: (res) => {
        // 这里会出现各种情况
        const data = res.data;
        const result = data.result;
        console.log('result', result);
        switch (result.code) {
          // input 界面无PID 故 手环无法进行绑定
          // 被其他账户绑定  调用接口 查询是否为 弱绑定接口
          case 'DV1001':
            wx.navigateTo({
              url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
            });
            break;
          // 设备被自己账户绑定 调用不同的接口去进行获取数据
          case 'DV1003':
            primaryRequest({
              url: 'listDeviceDetailsByIds',
              data: {
                appId: wx.getStorageSync(APPID),
                appSecret: wx.getStorageSync(APPSECRET),
                params: {
                  deviceList: [
                    {
                      deviceId: jsonResult.SN,
                    },
                  ],
                  token: wx.getStorageSync(GLOBAL_TOKEN),
                },
              },
              success: (listRes) => {
                const listResData = listRes.data;
                const listResResult = listResData.result;
                console.log('listResResult', listResResult);
                switch (listResResult.code) {
                  case '0':
                    const deviceList = listResResult.data.deviceList;
                    const { wifiConfigMode, deviceStatus, productId } =
                      deviceList[0];
                    jsonResult.PID = productId;
                    if (deviceStatus === 'online') {
                      // 直接跳转到 添加成功
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/success/index`,
                      });
                      return;
                    }
                    if (!productId) {
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`,
                      });
                      return;
                    }
                    if (wifiConfigMode.includes('bluetooth')) {
                      wx.setStorageSync('configType', 'bluetooth');
                      wx.navigateTo({
                        url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}&index=1`,
                      });
                      return;
                    }
                    // 软 ap 配网
                    if (wifiConfigMode.includes('wifi')) {
                      wx.setStorageSync('configType', 'wifi');
                      wx.navigateTo({
                        url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=wifi&SC=${jsonResult.SC}&index=1`,
                      });
                      return;
                    }
                    break;
                }
              },
              fail: () => {},
            });
            break;
          case '0':
            // 说明设备没有被绑定
            const resultData = result.data;
            const { wifiConfigMode, status, productId } = resultData;
            jsonResult.PID = productId;
            /**
             * 处理异常情况
             * 1. 非iot设备
             * 2. 设备不支持软ap 以及 蓝牙配网
             * 3. 设备已经在线的 情况
             * 4. 已经被绑定 但是未在线的情况
             */
            // 支持蓝牙配网 直接先走蓝牙配网

            // 设备在线 直接调用绑定接口
            if (status === 'online') {
              primaryRequest({
                url: 'bindDevice',
                data: {
                  appId: wx.getStorageSync(APPID),
                  appSecret: wx.getStorageSync(APPSECRET),
                  params: {
                    token: wx.getStorageSync(GLOBAL_TOKEN),
                    deviceId: jsonResult.SN,
                    code: jsonResult.SC,
                  },
                },
                success: (res) => {
                  const data = res.data;
                  const result = data.result;
                  console.log('res', result);
                  switch (result.code) {
                    // 返回 0 绑定成功，进入 添加成功 界面
                    case 'DV1087':
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/index?msg=设备未触发绑定事件`,
                      });
                      break;
                    case 'DV1016':
                    case 'DV1035':
                    case 'DV1025':
                      wx.navigateTo({
                        url: `/pages/configTool/linkImou/inputDeviceSC/index?SN=${jsonResult.SN}`,
                      });
                      break;
                    case '0':
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/success/index`,
                      });
                      break;
                    default:
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
                      });
                      break;
                  }
                },
                fail: (res) => {
                  console.log('res', '接口调用失败', res);
                },
              });
              return;
            }
            // productId 不存在 认为非 iot 设备
            if (!productId) {
              wx.navigateTo({
                url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`,
              });
              return;
            }
            if (wifiConfigMode.includes('bluetooth')) {
              wx.setStorageSync('configType', 'bluetooth');
              wx.navigateTo({
                url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}&index=1`,
              });
              return;
            }
            // 软 ap 配网
            if (wifiConfigMode.includes('wifi')) {
              wx.setStorageSync('configType', 'wifi');
              wx.navigateTo({
                url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=wifi&SC=${jsonResult.SC}`,
              });
              return;
            }
            // 这里处理 无法配网
            wx.navigateTo({
              url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`,
            });
            break;
        }
      },
    });
  },
});
