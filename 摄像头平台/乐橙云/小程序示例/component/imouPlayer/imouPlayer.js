// component/imouPlayer/imouPlayer.js
import { primaryRequest } from '../../service/network'
// 为了方便，当发生错误的时候，会触发自定义事件，便于父组件的发现
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  /**
   * 组件的属性列表
   */
  properties: {
    appId: {
      type: String,
    },
    appSecret: {
      type: String,
    },
    token: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    channelId: {
      type: String,
    },
    // 直播或者录播 1为直播，0为录播，默认为1
    type: {
      type: Number,
    },
    // 录像 1 为云录像 0为本地录像 默认为 1
    recordType: {
      type: Number,
      observer: function(newValue){
        this.setData({ videoFlag: false, audioFlag: true, audioImgSrc:'./images/sound.png' }, () => {
          console.log('this.data.audioFlag', this.data.audioFlag)
          if(this.livePlayer) this.livePlayer.stop({
            success: ()=>{
              this.triggerEvent('stateChange', {code: 6002, msg:'录像方式变化造成播放器暂停'})
            }
          })
        });
      },
    },
    beginTime: {
      type: String,
      observer:function(newValue){
        if(newValue === '00:00:00') return
        console.log('播放器开始时刻变化 beginTime', newValue)
        this.triggerEvent('stateChange', { code: 6001, msg:'播放器暂停' })
        // beginTime 触发暂停
        try{
          this.livePlayer && this.livePlayer.stop()
          this.setData({ videoFlag: false, state:{code: 2, msg: '录像加载中'} });
        }catch(e){
          console.warn('beginTim 暂停',e)
        }
      }
    },
    endTime: {
      type: String,
    },
    styleConfig: {
      type: Object,
      value: {
        width: '100vw',
        height: '420rpx',
      },
    },
    isTalk: {
      type: Boolean,
      value: false,
      observer: function (newValue) {
        if (newValue) {
          this.lastAudioFlag = this.data.audioFlag
          this.setData({ audioFlag: true, audioImgSrc:'./images/spund_hui.png' });
        } else {
          this.setData({ audioFlag: this.lastAudioFlag, audioImgSrc: this.lastAudioFlag? './images/sound.png':'./images/slience.png' });
        }
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 播放器地址
    src: '',
    // 播放状态
    videoFlag: false,
    audioFlag: true,
    fullScreenFlag: false,
    // 播放器的状态
    /** stateCod
     * 0 意味着 拉流中
     * 1 意味着出现错误，展示 stateMsg
     * 2 底部控制栏 消失
     * 3 正常播放
     * */
    state:{
      code: 2,
      msg:''
    },
    audioImgSrc: './images/sound.png',
    isHD: true, // 是不是高清，默认高清
    isSelectShow: false // 标高清选择框
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 通过 appId 获取参数
    // 播放 & 暂停
    async playOrPause() {
      if (this.data.videoFlag) {
        this.triggerEvent('stateChange', { code: 5001, detail: 'stopTalk'  });
        this.livePlayer.stop({
          success: ()=>{
            this.triggerEvent('stateChange', {code: 6001, msg:'播放器暂停', recordType: this.data.type === 0 ? this.data.recordType: 0})
            // 视屏暂停中
            this.setData({ videoFlag: false , state:{code: 1, msg: '视频暂停中...'} } );
          }
        });
      } else {
        this.setData({ state:{code: 1, msg: '视频恢复中...'} } );
        // 录播直接重新生成新的地址
        if(this.data.type === 0){
          this.getPlayUrl()
        }else{
          this.livePlayer.play()
        }
      }
    },
    // 开启声音&静音
    soundOrmute () {
      // 当对讲打开时
      if(!this.data.isTalk){
        this.setData({ audioFlag: !this.data.audioFlag, audioImgSrc: !this.data.audioFlag? './images/sound.png':'./images/slience.png'});
      }

    },
    // 截图 并保存到相册中
    snapshot() {
      // 需要判断 播放器是否在播放状态
      if (!this.data.videoFlag){
          this.triggerEvent('error', { code: '4000', msg: '播放器未处于播放状态' });
          return
      }
      let that = this
      wx.getSetting({
        success:(res) => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            that.saveImg();
          }
          else{
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success () {
                console.log('1111111')
                that.saveImg();
              },
              fail(){
                that.authConfirm()
              }
            })
          }
        }
      })

    },
    saveImg () {
      this.livePlayer.snapshot({
        success: ({ tempImagePath }) => {
          // 成功之后，保存到手机用户相册
          wx.saveImageToPhotosAlbum({
            filePath: tempImagePath,
            success: () => {
              console.log('保存成功');
              wx.showToast({
                title: '截图已保存至手机相册',
                icon:'none',
              })
            },
            fail: (res) => {
              throw res
            },
          });
        },
        fail: (res) => {
          // this.triggerEvent('error', { code: '4001', msg: '请重试' });
        },
      });
    },
    exitOrFull() {
      this.data.fullScreenFlag?this.livePlayer.exitFullScreen():this.livePlayer.requestFullScreen({ direction: 90 });
      this.setData({fullScreenFlag: !this.data.fullScreenFlag, isSelectShow: false  })
    },
    // 捕捉错误, 并触发错误事件
    error(error) {
      console.log('imouplayer error')
      console.log(error)
      if(error.detail){
        if(error.detail.errCode === 10001){
          this.setData({state:{code:2, msg:'应用无录音权限，请开启后重试'}})
        }
        this.triggerEvent('error', error.detail);
      }else
        this.triggerEvent('error', error);
    },
    // 播放器状态，并体现在播放器中
    state(data) {
      const { code } = data.detail;
      switch (code) {
        // 视频播放开始 播放器开始渲染第一个网络包
        case 2001:
          console.log('2001 开始播放',(new Date()).getTime() - this.time)
          break;
        case 2003:
          this.setData({ videoFlag: true, state:{ code:3, msg:'' }});
          break;
        case 2004:
          break;
        case 2103:
          // 先暂停播放器，再获取播放 避免网络波动
          this.livePlayer.stop({
            success: () => {
              // 重试三次，然后暂停
              if(this.one < 3){
                this.one ++
                this.getPlayUrl()
              } else {
                this.setData({ videoFlag: false, state:{ code:3, msg:'' }});
              }
            }
          })
          break;
        // 网络断联
        case -2301:
          // 清空，避免影响到后续二次重试
          this.one = false
          this.setData({ videoFlag: false, state: { code: 2, msg: '网络出错, 请检查网络后再重试...' } });
          break;
      }
      this.triggerEvent('stateChange', data.detail);
    },
    // 获取播放地址 & getPlayUrl
    getPlayUrl() {
      this.time = (new Date()).getTime()
      const { token,deviceId,channelId,recordType,beginTime,endTime,appId,appSecret,type }  = this.data
      this.setData({ videoFlag: false,state:{ code : 2, msg:'视频流获取中...' } });
      // 如果为录播 且开始时间&结束时间没有 则赋值默认的 凌晨到最后 23:59:59
      if(type === 0){
        if (!beginTime || !endTime) {
          const data = this.getRecordTimeRange();
          beginTime = data.beginTime;
          endTime = data.endTime;
        }
      }
      console.log('getPlayUrl', beginTime, recordType ? 'cloudRecord' : 'localRecord')
      this.requestTask = primaryRequest({
        url: 'createDeviceFlvLive',
        msg: '获取播放地址中',
        data: {
          appId,
          appSecret,
          params: {
            token,
            deviceId,
            channelId,
            type: type?'realTime': 'playback',
            beginTime,
            endTime,
            recordType: recordType ? 'cloudRecord' : 'localRecord',
          },
        },
        success: (res)=>this.requestSuccess(res)
      });

    },
    // 默认时间获取
    // 生成 今天 默认录像时间区间
    getRecordTimeRange() {
      const currentTime = new Date();
      const YY = currentTime.getFullYear();
      const MM = this.setValue(currentTime.getMonth() + 1);
      const DD = this.setValue(currentTime.getDate());
      const hh = this.setValue(currentTime.getHours());
      const mm = this.setValue(currentTime.getMinutes());
      const ss = this.setValue(currentTime.getSeconds());
      const beginTime = `${YY}-${MM}-${DD} 00:00:00`;
      const endTime = `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
      return {
        beginTime,
        endTime,
      };
    },
    setValue(value) {
      if (typeof Number(value) !== 'number') return value;
      return value < 10 ? `0${value}` : value;
    },
    // 函数播放
    async play(){
      // 修改下提示语 且播放时，把音频关闭
      this.setData({ videoFlag: false, state:{ code: 2,  msg:'播放器拉流中...'} });
      this.requestTask && this.requestTask.abort()
      this.livePlayer && this.livePlayer.stop({
          success: (res)=>{
            console.log('play 播放器暂停')
            this.getPlayUrl()
          }}
      )
    },
    requestSuccess: function(res){
      const { token,deviceId,channelId,appId,appSecret }  = this.data
      let result = res.data.result
      switch(result.code){
        // 直播已存在
        case 'LV1001':
          this.requestTask = primaryRequest({
            url: 'queryDeviceFlvLive',
            msg: '获取播放地址中',
            data: {
              appId,
              appSecret,
              params: {
                token,
                deviceId,
                channelId,
              },
            },
            success: (res) => this.requestSuccess(res)
          })
          break;
        case '0':
          // 高清
          this.URL = result.data;
          console.log('开始播放', (new Date()).getTime() - this.time)
          const { isHD } = this.data
          const src =  isHD ? this.URL.flvHD:this.URL.flv;
          // 先调用stop函数，再调用 play 函数
          this.setData({ src },()=>{
            this.livePlayer.play({
              success: ()=>{
                console.log('URL',result.data)
                console.log('调用播放器成功', (new Date()).getTime() - this.time)
              }
            })
            console.log('调用播放器播放', (new Date()).getTime() - this.time)
          });
          break;
        // 设备离线 & 设备离线
        case 'OP1019':
        case 'DV1007':
            this.livePlayer && this.livePlayer.stop()
            this.setData({state:{code:2,  msg: result.msg}});
            this.triggerEvent('error', result);
            break;
          default:
          // 直播不存在
            this.livePlayer && this.livePlayer.stop()
            this.setData({ state: { code: 1, msg: result.msg } });
            this.triggerEvent('error', result);
      }
    },
    // 修改高清&标清按钮  出现按钮
    showOrCloseSelect () {
      this.setData({
        isSelectShow: !this.data.isSelectShow
      })
    },
    changeHD () {
      this.changeHdOrSd(true)
    },
    changeSD () {
      this.changeHdOrSd(false)
    },
    // flag 为 true 则设置为高清 & 为 false 则设置为 标清
    changeHdOrSd (flag) {
      this.triggerEvent('stateChange', { code: 5001, detail: 'stopTalk'  });
      if (flag === this.data.isHD) {
        this.setData({ isSelectShow: false})
        return;
      }
      this.livePlayer.stop({
        success: () => {
          const url = flag ? this.URL.flvHD:this.URL.flv;
          this.setData({ src: url, isHD: !this.data.isHD,isSelectShow: false, state:{code:2,  msg:'获取播放地址中...'} },()=>{
            this.livePlayer.play({
              success: ()=>{
                console.log('调用播放器成功', (new Date()).getTime() - this.time)
              }
            })
            console.log('调用播放器播放', (new Date()).getTime() - this.time)
          });
        }
      })
    },
    // 获取权限
    authConfirm () {
      const that = this
      wx.showModal({
        content: '您没打开保存图片权限，是否去设置打开？',
        confirmText: "确认",
        cancelText: "取消",
        success: (res) =>{
          if (res.confirm) {
            wx.openSetting({
              success :(res) => {
                if (res.authSetting['scope.writePhotosAlbum']) {
                  that.saveImg();
                }
                else {
                  wx.showToast({
                    title: '您没有授权，无法保存到相册',
                    icon: 'none'
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '您没有授权，无法保存到相册',
              icon: 'none'
            })
          }
        }
      });
    },

  },
  lifetimes: {
    async ready() {
      // 创建 liveplayer 播放地址
      this.livePlayer = wx.createLivePlayerContext('live-player', this);
      // 获取数据
      this.setData({state:{code:2,  msg:'获取播放地址中...'}})
      this.one = 0
    },
    error(e) {
      this.triggerEvent('error', e);
      console.warn('lieftime error', e);
    },
    detached(){
      this.livePlayer && this.livePlayer.stop()
    }
  },
});
