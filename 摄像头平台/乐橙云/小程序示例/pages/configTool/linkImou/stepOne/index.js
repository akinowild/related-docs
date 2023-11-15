// pages/configTool/linkImou/stepOne/index.js
import {
  GLOBAL_TOKEN,
  APPID,
  APPSECRET
} from '../../../../utils/config.js'

import {
  primaryRequest
} from '../../../../service/network.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    number: 120
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
    // 调用接口 获取信息 unbindDeivceInfo
    this.setTimeouTimer = setTimeout(() => {
      this.unBindDeviceInfo()  
    }, 1000);
    this.setIntervalTimer = setInterval(() => {
      let number = this.data.number - 1
      if (number === 0) {
        // this.onUnload()
        // 跳入失败界面
        // 这里直接跳转到 添加失败
        this.redirectFlag = true
        wx.redirectTo({
          url: `/pages/configTool/deviceResult/fail/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
        });
      }
      this.setData({
        number
      })
    }, 1000)
    wx.enableAlertBeforeUnload({
      message: '设备添加尚未完成。如果退出，您将需要重新开始添加流程。是否退出？',
      success(res) {
        console.log('success:', res)
      },
      fail(res) {
        console.log('fail:', res)
      },
      complete(res) {
        console.log('complete:', res)
      }
    })
  },
  unBindDeviceInfo() {
    console.log("unBindDeviceInfo",this.requestCloudTask)
    this.requestCloudTask && this.requestCloudTask.abort()
    this.requestCloudTask = primaryRequest({
      url: 'unBindDeviceInfo',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          token: wx.getStorageSync(GLOBAL_TOKEN),
          deviceId: this.options.SN
        }
      },
      success: (res) => {
        this.onUnBindDeviceInfo(res)
      },
      fail: (res) => {
        this.setTimeouTimer && clearTimeout(this.setTimeouTimer)
        this.setTimeouTimer = setTimeout(() => {
          this.unBindDeviceInfo()
        }, 3000)
      }
    })
  },
  listDeviceDetailsByIds() {
    this.requestCloudTask && this.requestCloudTask.abort()
    this.requestCloudTask = primaryRequest({
      url: 'listDeviceDetailsByIds',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          "deviceList": [{
            "deviceId": this.options.SN
          }],
          token: wx.getStorageSync(GLOBAL_TOKEN),
        }
      },
      success: (listRes) => {
        this.onListDeviceDetailsByIds(listRes)
      },
      fail: () => {
        this.setTimeouTimer && clearTimeout(this.setTimeouTimer)
        this.setTimeouTimer = setTimeout(() => {
          this.listDeviceDetailsByIds()
        }, 3000)
      }
    })
  },
  onListDeviceDetailsByIds(listRes) {
    const listResData = listRes.data
    const listResResult = listResData.result
    switch (listResResult.code) {
      case '0':
        const deviceList = listResResult.data.deviceList
        const {
          deviceStatus
        } = deviceList[0]
        // 设备在线 直接调用绑定接口 跳转到绑定页面
        console.log('deviceStatus', deviceStatus, deviceList[0])
        if (deviceStatus === 'online') {
          // 这里直接跳转到 添加成功
          this.redirectFlag = true
          wx.redirectTo({
            url: `/pages/configTool/deviceResult/success/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
          });
        } else {
          // 3s 之后再次调用的 获取设备在线的接口
          this.setTimeouTimer && clearTimeout(this.setTimeouTimer)
          this.setTimeouTimer = setTimeout(() => {
            this.listDeviceDetailsByIds()
          }, 3000)
          break;
        }
    }
  },
  onUnBindDeviceInfo(res) {
    // 这里会出现各种情况
    const data = res.data
    const result = data.result
    console.log('result', result)
    switch (result.code) {
      // 设备被自己账户绑定 调用不同的接口去进行获取数据
      case 'DV1003':
        this.listDeviceDetailsByIds()
        break;
      case '0':
        // 说明设备没有被绑定
        const resultData = result.data
        const {
          status
        } = resultData
        // 设备在线 直接调用绑定接口 跳转到绑定页面
        if (status === 'online') {
          // 这里跳转到 绑定设备
          this.redirectFlag = true
          wx.redirectTo({
            url: `/pages/configTool/linkImou/stepTwo/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
          });
        } else {
          // 3s 之后再次调用的 获取设备在线的接口
          this.setTimeouTimer && clearTimeout(this.setTimeouTimer)
          this.setTimeouTimer = setTimeout(() => {
            this.unBindDeviceInfo()
          }, 3000)
        }
        // 这里处理异常情况
        break;
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('onUnload', this.requestCloudTask,this.setTimeouTimer,this.setIntervalTimer)
    this.requestCloudTask && this.requestCloudTask.abort()
    clearTimeout(this.setTimeouTimer)
    clearInterval(this.setIntervalTimer)
    wx.disableAlertBeforeUnload()
    const pages = getCurrentPages()
    let index = 0
    for (let i = 0; i < pages.length; i++) {
      if ("pages/configTool/addDevice/index" === pages[i].route) {
        index = pages.length - i - 2
        break
      }
    }
    if(index < 0 ) index = 0
    console.log(index, 'index')
    if (!this.redirectFlag && index !==0 ) {
      wx.navigateBack({
        delta: index
      })
    }
  },
})