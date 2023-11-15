// pages/configTool/addDevice/index.js

import {
  GLOBAL_TOKEN,
  APPID,
  APPSECRET
} from '../../../utils/config.js'

import {
  primaryRequest
} from '../../../service/network.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  addDevice() {
    /** 调用二维码获取二维码的数据 */
    wx.scanCode({
      success: (res) => {
        // {SN:9B0A5D0PAZ8C8DC,SC:L2FC5E1E,PID:psdCf81A}
        let jsonResult = {}
        let result = res.result.trim().slice(1, -1)
        console.log(result, 'res.result')
        // SN:9B0A5D0PAZ8C8DC,SC:L2FC5E1E,PID:psdCf81A
        // 这里需要异常情况处理 二维码存在问题
        result.split(',').forEach(item => {
          let temp = item.split(':')
          jsonResult[temp[0]] = temp[1]
        })
        console.log(jsonResult, 'jsonResult')
        if (!jsonResult.SN) {
          wx.showToast({
            title: '无效二维码',
            icon: 'none'
          })
          return
        }
        this.onAddDevice(jsonResult)
        // 调用接口 获取信息 unbindDeivceInfo

      },
      fail: (res) => {
        console.log('fail', res)
        // 超时重试
        // this.settimer = setTimeout(() => {
        //     this.onAddDevice(jsonResult)
        // }, 3000);
      },
      complete: () => {

      },

    })
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
          deviceId: jsonResult.SN
        }
      },
      success: (res) => {
        // 这里会出现各种情况
        const data = res.data
        const result = data.result
        console.log('result', result)
        switch (result.code) {
          // 被其他账户绑定  调用接口 查询是否为 弱绑定接口
          case 'DV1001':
            // pid 为空
            if(!jsonResult.PID){
              wx.navigateTo({
                url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
              });
              break
            }
            primaryRequest({
              url: 'listProductDetail',
              data: {
                appId: wx.getStorageSync(APPID),
                appSecret: wx.getStorageSync(APPSECRET),
                params: {
                  token: wx.getStorageSync(GLOBAL_TOKEN),
                  productIds: [jsonResult.PID],
                }
              },
              success: (listRes) => {
                const listResData = listRes.data
                const listResResult = listResData.result
                console.log('listResResult', listResResult)
                switch (listResResult.code) {
                  case '0':
                    const deviceList = listResResult.data.item[0]
                    if(!deviceList){
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
                      });
                      break
                    }
                    const {
                      bindType
                    } = deviceList
                    console.log('res', res, bindType)
                    // 弱绑定 暂不支持
                    // if (bindType === '0') {
                    //   // 弱绑定 雷达  走软ap
                    //   wx.navigateTo({
                    //     url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=wifi&SC=${jsonResult.SC}`
                    //   });
                    //   return
                    // }
                    // 事件绑定
                    if (bindType === '3') {
                      primaryRequest({
                        url: 'bindDevice',
                        data: {
                          appId: wx.getStorageSync(APPID),
                          appSecret: wx.getStorageSync(APPSECRET),
                          params: {
                            token: wx.getStorageSync(GLOBAL_TOKEN),
                            deviceId: jsonResult.SN,
                            code: jsonResult.SC,
                          }
                        },
                        success: (res) => {
                          const data = res.data
                          const result = data.result
                          console.log('res', result)
                          switch (result.code) {
                            case 'DV1087':
                              wx.navigateTo({
                                url: `/pages/configTool/deviceResult/index?msg=设备未触发绑定事件`,
                              });
                              break
                              // 返回 0 绑定成功，进入 添加成功 界面
                            case '0':
                              wx.navigateTo({
                                url: `/pages/configTool/deviceResult/success/index?index=1`
                              });
                              break;
                              // 事件绑定 除成功，其余都提示接口返回的信息
                            default:
                              wx.navigateTo({
                                url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
                              });
                              break;
                          }
                        },
                        fail: (res) => {
                          console.log('res', '接口调用失败', res)
                        }
                      })
                      return
                    }
                    // 其他情况走 默认绑定失败逻辑
                    wx.navigateTo({
                      url: `/pages/configTool/deviceResult/index?msg=${result.msg}`,
                    });
                    break;
                }
                console.log('res', res)
              }
            })
            break;
            // 设备被自己账户绑定 调用不同的接口去进行获取数据
          case 'DV1003':
            primaryRequest({
              url: 'listDeviceDetailsByIds',
              data: {
                appId: wx.getStorageSync(APPID),
                appSecret: wx.getStorageSync(APPSECRET),
                params: {
                  "deviceList": [{
                    "deviceId": jsonResult.SN
                  }],
                  token: wx.getStorageSync(GLOBAL_TOKEN),
                }
              },
              success: (listRes) => {
                const listResData = listRes.data
                const listResResult = listResData.result
                console.log('listResResult', listResResult)
                switch (listResResult.code) {
                  case '0':
                    const deviceList = listResResult.data.deviceList
                    const {
                      wifiConfigMode, deviceStatus, productId
                    } = deviceList[0]
                    if (deviceStatus === 'online') {
                      // 直接跳转到 添加成功
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/success/index`
                      });
                      return
                    }
                    if (!productId) {
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`
                      });
                      return
                    }
                    if (wifiConfigMode.includes('bluetooth')) {
                      wx.setStorageSync('configType', 'bluetooth')
                      wx.navigateTo({
                        url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}&index=1`
                      });
                      return
                    }
                    // 软 ap 配网
                    if (wifiConfigMode.includes('wifi')) {
                      wx.setStorageSync('configType', 'wifi')
                      wx.navigateTo({
                        url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=wifi&SC=${jsonResult.SC}&index=1`
                      });
                      return
                    }
                    break;
                }
              },
              fail: () => {}
            })
            break;
          case '0':
            // 说明设备没有被绑定
            const resultData = result.data
            const {
              wifiConfigMode, status, productId
            } = resultData
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
                    code: jsonResult.SC || '',
                  }
                },
                success: (res) => {
                  const data = res.data
                  const result = data.result
                  console.log('res', result)
                  switch (result.code) {
                    // 返回 0 绑定成功，进入 添加成功 界面
                    case 'DV1087':
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/index?msg=设备未触发绑定事件`,
                      });
                      break
                    case 'DV1016':
                    case 'DV1035':
                    case 'DV1025':
                      wx.navigateTo({
                        url: `/pages/configTool/linkImou/inputDeviceSC/index?SN=${jsonResult.SN}`
                      });
                      break;
                    case '0':
                      wx.navigateTo({
                        url: `/pages/configTool/deviceResult/success/index?index=1`
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
                  console.log('res', '接口调用失败', res)
                }
              })
              return
            }
            // productId 不存在 认为非 iot 设备
            if (!productId) {
              wx.navigateTo({
                url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`
              });
              return
            }
            if (wifiConfigMode.includes('bluetooth')) {
              wx.setStorageSync('configType', 'bluetooth')
              wx.navigateTo({
                url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}&index=1`
              });
              return
            }
            // 软 ap 配网
            if (wifiConfigMode.includes('wifi')) {
              wx.setStorageSync('configType', 'wifi')
              wx.navigateTo({
                url: `/pages/configTool/wifiDataConfig/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=wifi&SC=${jsonResult.SC}`
              });
              return
            }
            // 这里处理 无法配网
            wx.navigateTo({
              url: `/pages/configTool/deviceResult/cantFail/index?SN=${jsonResult.SN}&PID=${jsonResult.PID}&type=bluetooth&SC=${jsonResult.SC}`
            });
            break;
        }
      }
    })
  },
  inputDevice() {
    // 跳转到 设备序列号 & 安全码的输入界面
    wx.navigateTo({
      url: '/pages/configTool/inputDeviceData/index?index=1'
    })
  }
})