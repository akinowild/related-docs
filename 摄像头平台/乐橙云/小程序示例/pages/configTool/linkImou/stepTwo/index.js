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
    number: 60

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setIntervalTimer = setInterval(() => {
      let number = this.data.number - 1
      if (number === 0) {
        // this.onLoad()
        // 跳入失败界面
        this.redirectFlag = true
        wx.redirectTo({
          url: `/pages/configTool/deviceResult/fail/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}&source=bind2`
        });
      }
      this.setData({
        number
      })
    }, 1000)
    primaryRequest({
      url: 'bindDevice',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          token: wx.getStorageSync(GLOBAL_TOKEN),
          deviceId: this.options.SN,
          code: this.options.SC,
        }
      },
      success: (res) => {
        const data = res.data
        const result = data.result
        //  暂不考虑异常情况
        switch (result.code) {
          // 返回 0 绑定成功，进入 添加成功 界面
          case 'DV1035':
            // 这里直接跳转到 重新输入设备密码
            this.redirectFlag = true
            wx.redirectTo({
              url: `/pages/configTool/linkImou/inputDeviceSC/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
            });
            break
          case '0':
            // 这里直接跳转到 添加成功
            this.redirectFlag = true
            wx.redirectTo({
              url: `/pages/configTool/deviceResult/success/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
            });
            break;
        }
      },
      fail: (res) => {

      }
    })
  },
  onBindDevice() {
    primaryRequest({
      url: 'bindDevice',
      data: {
        appId: wx.getStorageSync(APPID),
        appSecret: wx.getStorageSync(APPSECRET),
        params: {
          token: wx.getStorageSync(GLOBAL_TOKEN),
          deviceId: this.options.SN,
          code: this.options.SC,
        }
      },
      success: (res) => {
        const data = res.data
        const result = data.result
        //  暂不考虑异常情况
        switch (result.code) {
          // 返回 0 绑定成功，进入 添加成功 界面
          case 'DV1035':
            // 这里直接跳转到 重新输入设备密码
            this.redirectFlag = true
            wx.redirectTo({
              url: `/pages/configTool/linkImou/inputDeviceSC/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
            });
            break
          case '0':
            // 这里直接跳转到 添加成功
            this.redirectFlag = true
            wx.redirectTo({
              url: `/pages/configTool/deviceResult/success/index?SN=${this.options.SN}&PID=${this.options.PID}&SC=${this.options.SC}`
            });
            break;
        }
      },
      fail: (res) => {
        // 失败之后 3s 之后再次调用 bindDevice 接口
        this.setTime = setTimeout(() => {
          this.onBindDevice()
        }, 3000);
      }
    })
  },
  onUnload() {
    clearTimeout(this.setTime)
    clearInterval(this.setIntervalTimer)
    const pages = getCurrentPages()
    let index = 0
    for (let i = 0; i < pages.length; i++) {
      if ("pages/configTool/addDevice/index" === pages[i].route) {
        index = pages.length - i - 2
        break
      }
    }
    if (index < 0) index = 0
    console.log(index, 'index')
    if (!this.redirectFlag && index !== 0) {
      wx.navigateBack({
        delta: index
      })
    }
  },
})