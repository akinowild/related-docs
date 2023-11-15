import { TRY_APPID, TRY_APPSECRET, TRY_TOKEN } from '../../utils/config';
// pages/playBack/index.js
import request from '../../component/imouPlayer/request'
import { getHourMiSe  } from '../../utils/util'
import { primaryRequest } from '../../service/network'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appId: '',
    appSecret: '',
    token: '',
    deviceId: '',
    channelId: '',
    //录像 1 为云录像 0 为本地录像 默认为 1
    recordType: 1,
    date: '',
    beginTime: '00:00:00',
    endTime: '23:59:59',
    timeState: 0,
    // 功能是否可以点击
    endDate:'',
    records: [],
    // 本地录像加载完成
    disable: false,
    text: '本地录像加载中。。。'
  },
  playStateChange({detail}){
    console.log('playStateChange',detail)
    // 当 code 值 为 2004 时 认为 开始播放
    if(detail.code === 2004){
      // 直接调用 开始滚动，避免 时延
      this.timeLine.beginTimeScroll()
    }
    if(detail.code === 6001){
      // 暂停进度条
      this.timeLine && this.timeLine.stopTimeScroll()
      // 当为 云录像暂停，则 将 时间指定为此次片段的左侧
      if(detail.recordType === 1){
          // 需要获取下时间，然后对时间 进行
          this.time  =  this.timeLine && this.timeLine.getLeftTime()
          this.time  =  this.time || '00:00:00'
      }
      // 更新播放时间
      this.setData({beginTime: this.time})
    }
    if(detail.code === 6002){
      this.timeLine.stopTimeScroll()
       // 更新播放时间
      this.setData({beginTime: '00:00:00'})
    }
    // 网络断联
    if(detail.code === -2301){
      // 暂停滚动条
      this.timeLine.stopTimeScroll()
    }

  },
  // 日期变化 如何关闭 已有请求 或者丢弃已有的请求 或者使用 request 的方式，success的方式 重改代码
  bindDateChange:async function({detail}){
    // 进行考虑 异步渲染的方式 进行渲染
    console.log(detail.value)
    // 存在先前请求未请求，关闭
    try{
      this.requestCloudTask && this.requestCloudTask.abort()
      this.requestLocalTask && this.requestLocalTask.abort()
      this.localTimeOut && clearTimeout(this.localTimeOut)
      this.cloudTimeOut && clearTimeout(this.cloudTimeOut)
    }catch(e){
      console.warn('请求中止调用出错', e)
    }
    // 清空进度条的数据 且为云录像
    this.setData({date: detail.value, records: [], disable:false},()=>{
      // 日期已经更新，就开始获取相关数据 直接 先请求云录像 后请求本地录像
      this.getRecords()
      this.getLocalRecords()
    })
  },
  // 云录像的请求函数
  requestCloudSuccess: function(res){
    const { token,deviceId,channelId,appId,appSecret,date } = this.data
    let data = res.data.result.data
    console.log('requestCloudSuccess', 'requestCloudSuccess',data)
    this.cloudRecrods = this.cloudRecrods.concat(data.records || [])
    if(this.data.recordType) this.setRords(this.cloudRecrods)
    if(data.records.length === 100){
      // 继续请求
        this.requestCloudTask = primaryRequest({
          url: 'queryCloudRecords',
          data: {
            appId,
            appSecret,
            params: {
              token,
              deviceId,
              channelId,
              "beginTime": data.records[99].endTime,
              "endTime": `${date} 23:59:59`,
              "queryRange":"1-100"
            }
          },
          success: this.requestCloudSuccess
        })
    }
  },
  // 本地录像的请求函数
  requestLocalSuccess: function(res){
    const { token,deviceId,channelId,appId,appSecret,date } = this.data
    let data = res.data.result.data
    // 异常情况
    // 这里可以认为本地录像加载完成
    console.log('requestLocalSuccess', res)
    if(!data){
      this.setData({disable: true})
      if(!this.data.recordType){
        this.setRords(this.localRecords)
      }
      return
    }
    this.localRecords = this.localRecords.concat(data.records || [])
    if(!data.records){

      this.setData({disable: true})
      if(!this.data.recordType){
        this.setRords(this.localRecords)
      }
      return
    }
    if(data.records.length === 100){
      // 继续请求
      let beginTime = data.records[data.records.length - 1].endTime
      this.requestLocalTask = primaryRequest({
        url: 'queryLocalRecords',
        data: {
          appId,
          appSecret,
          params: {
            token,
            deviceId,
            channelId,
            "beginTime": beginTime,
            "endTime": `${date} 23:59:59`,
            "queryRange": '1-100'
          }
        },
        success: this.requestLocalSuccess
      })
      // this.localTimeOut =  setTimeout(()=>{
      //   this.requestLocalTask = primaryRequest({
      //     url: 'queryLocalRecords',
      //     data: {
      //       appId,
      //       appSecret,
      //       params: {
      //         token,
      //         deviceId,
      //         channelId,
      //         "beginTime": beginTime,
      //         "endTime": `${date} 23:59:59`,
      //         "queryRange": '1-100'
      //       }
      //     },
      //     success: this.requestLocalSuccess
      //   })
      // }, 30000)
    }else{
      if(!this.data.recordType){
          this.setRords(this.localRecords)
      }
      this.setData({disable: true})
    }
  },
  handleError: function ({ detail }) {
    console.log(detail);
    wx.showToast({
      icon: 'none',
      title: detail.msg,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { deviceId, channelId, appId, appSecret, token } = options;
    console.log(options);
    let  date = new Date()
    date = `${date.getFullYear()}-${date.getMonth()>8?date.getMonth()+1: '0'+ (date.getMonth()+1) }-${date.getDate()>9?date.getDate():'0'+date.getDate()}`
    this.setData({
      deviceId,
      channelId,
      appId: appId || TRY_APPID,
      token: token || wx.getStorageSync(TRY_TOKEN),
      appSecret: appSecret || TRY_APPSECRET,
      date,
      endDate: date
    });


  },
  // 云录像进行异步渲染
  async getRecords(){
     const {token,deviceId,channelId,appId,appSecret,date } = this.data
    this.cloudRecrods = []
    this.requestCloudTask = primaryRequest({
        url: 'queryCloudRecords',
        data: {
          appId,
          appSecret,
          params: {
            token,
            deviceId,
            channelId,
            "beginTime":`${date} 00:00:00`,
            "endTime":`${date} 23:59:59`,
            "queryRange":"1-100"
          }
        },
        success: this.requestCloudSuccess
      })
  },
  // 本地录像进行异步渲染
  async getLocalRecords(){
      const { token,deviceId,channelId,appId,appSecret,date } = this.data
      this.localRecords = []
      this.requestLocalTask =  primaryRequest({
        url: 'queryLocalRecords',
        data: {
          appId,
          appSecret,
          params: {
            token,
            deviceId,
            channelId,
            type:'all',
            "beginTime":`${date} 00:00:00`,
            "endTime": `${date} 23:59:59`,
            "queryRange":"1-100"
          }
        },
      success: this.requestLocalSuccess
    })
  },
  /**
   * 更新 localRords
   */
  setRords: function(data){
    // if(data.length === 0 ) return []
    const records = data.map(item => {
      const beginTimeS = (new Date(item.beginTime.replace(' ','T')+'Z')).getTime()
      const endTimeS = (new Date(item.endTime.replace(' ','T')+'Z')).getTime()
      return {
       beginTime: item.beginTime,
       endTime: item.endTime,
       beginTimeS: beginTimeS,
       endTimeS: endTimeS,
    }})
    console.log('setRords', data)
    this.setData({ records: records})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    // 获取 palyer
    this.player = this.selectComponent('#imou-player-playback');
    this.timeLine = this.selectComponent('#timeLine')

  },
  snapshot: function () {
    // 调用组件的截图函数
    if(this.player.data.videoFlag){
      this.player.snapshot();
    }else{
      wx.showToast({
        title: '视频暂未播放',
        icon: 'none'
      })
    }

  },
  bindtimeChange({detail}){
    // 更新时间
    // console.log('bindtimeChange', detail)
    this.time = detail.date
  },
  bindUserChange({detail}){
     // 重新拉流 & 修改 beginTime
    console.log('bindUserChange', detail)
    // 更新 时间
    this.time = detail.date;
    // 修改开始时间
    if(!this.data.recordType && !this.data.disable){
      // 本地录像, 但本地录像未加载完，不触发播放
      return
    }
    this.setData({beginTime: detail.date },()=>{
        // 调用播放器进行播放
        console.log('拉流 拉流 拉流')
        this.player.play()
    })
  },
  // 云录像本地录像切换
  bindcheckChange({detail}){
      // 重新拉流 & 修改 beginTime
      const records = detail ? this.cloudRecrods : this.localRecords
      // beginTime 监听修改只做暂停设置 这里也需要更新时间, 这里的 beginTime 应设置为 录像 0 的
      let time = '00:00:00'
      // 触发 进度条 恢复到 初始状态
      this.setData({records: [], recordType: detail},()=>{
          console.log(this.data.recordType)
          // 本地录像切换, 修改为 disable 之后设置
          if(!detail){
            if(this.data.disable)
              this.setRords(records)
          }else{
            this.setRords(records)
          }

      })
      this.time = time
  },

  enterPlayLive(){
    wx.navigateBack({
      delta: 0,
    })
    // wx.redirectTo({ url: `/pages/selfDevice/openvideoplay/openvideoplay?deviceinfo=${this.data.deviceId}-${this.data.channelId}` });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    // 获取 云录像
    this.getLocalRecords()
    this.getRecords()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    try{
      console.log('playback onunload')
      this.requestCloudTask && this.requestCloudTask.abort()
      this.requestLocalTask && this.requestLocalTask.abort()
      this.localTimeOut && clearTimeout(this.localTimeOut)
      this.cloudTimeOut && clearTimeout(this.cloudTimeOut)
  }catch(e){
    console.warn('中止请求错误', e)
  }
  },
  enterPlayBack:function(){
      const  { deviceId,
        appSecret,
        appId,
        token,
        channelId,} = this.data
      // 为了后续复用, 将参数带上
      wx.navigateTo({ url: `/pages/packLocal/index?deviceId=${deviceId}&channelId=${channelId}&token=${token}&appId=${appId}&appSecret=${appSecret}` });
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      try{
          console.log('playback onunload')
          this.requestCloudTask && this.requestCloudTask.abort()
          this.requestLocalTask && this.requestLocalTask.abort()
          this.localTimeOut && clearTimeout(this.localTimeOut)
          this.cloudTimeOut && clearTimeout(this.cloudTimeOut)
      }catch(e){
        console.warn('中止请求错误', e)
      }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  // reqeust 请求

});
