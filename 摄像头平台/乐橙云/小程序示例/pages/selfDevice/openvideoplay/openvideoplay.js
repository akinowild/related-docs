const app = getApp();

import { GLOBAL_TOKEN, APPID, APPSECRET } from '../../../utils/config.js';
import { primaryRequest } from '../../../service/network';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    did: '',
    cid: '',
    kittoken: '',
    appId: '',
    appSecret: '',
    token: '',
    deviceId: '',
    channelId: '',
    pushUrl: '',
    isPtzPanel: false,
    isTalk: false,
    ptzImgSrc: '/image/selfDevice/yuntai.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let deviceinfo = options.deviceinfo.split('_');
    console.log(deviceinfo, 'deviceinfo');

    let deviceId = deviceinfo[0];
    let channelId = deviceinfo[1];
    let multiFlag = deviceinfo[5];

    let channelAbility =
      multiFlag === 'true'
        ? deviceinfo[6].split(',')
        : deviceinfo[2].split(',');
    let channelStatus = deviceinfo[3];
    // nvr 设备对讲 需要诶外参数
    let isNvr = deviceinfo[4];

    // 获取设备能力集，并对所需能力集进行 真假值 过滤
    let tempAbility = {
      PT: false,
      AudioTalk: false,
      // 是否在线
      online: channelStatus === 'online',
      isNvr: isNvr === 'NVR',
    };
    if (channelAbility.includes('PT') || channelAbility.includes('PTZ'))
      tempAbility.PT = true;
    if (
      channelAbility.includes('AudioTalk') ||
      channelAbility.includes('AudioTalkV1')
    )
      tempAbility.AudioTalk = true;
    console.log('tempAbility', tempAbility);
    // 获取今天之后的时间
    this.setData({
      deviceId,
      channelId,
      channelAbility: tempAbility,
      appId: wx.getStorageSync(APPID),
      appSecret: wx.getStorageSync(APPSECRET),
      token: wx.getStorageSync(GLOBAL_TOKEN),
    });
    app.globalData.videoListRefresh = false;
  },
  snapshot: function () {
    // 调用组件的截图函数
    // if(!this.checkStatus()) return
    // 这里要判断权限
    if (this.player.data.videoFlag) {
      this.player.snapshot();
    } else {
      wx.showToast({
        title: '视频暂未播放',
        icon: 'none',
      });
    }
  },
  handleError({ detail }) {
    wx.showToast({
      title: detail.msg || detail.detail.errMsg,
      icon: 'none',
    });
  },
  enterPlayBack: function () {
    const { deviceId, appSecret, appId, token, channelId } = this.data;
    // 为了后续复用, 将参数带上
    wx.navigateTo({
      url: `/pages/playBackRedirect/index?deviceId=${deviceId}&channelId=${channelId}&token=${token}&appId=${appId}&appSecret=${appSecret}`,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取 palyer
    // 手动调用播放器的播放
    try {
      this.player = this.selectComponent('#imou-player');
      this.player.play();
      this.pushcontext = wx.createLivePusherContext('livePusher', this);
      this.pushcontext.stop();
    } catch (e) {
      console.warn(e);
    }
  },
  checkStatus: function (name) {
    // 判断设备是否在线
    const { channelAbility } = this.data;
    if (!channelAbility.online) {
      wx.showToast({
        title: '设备未在线',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
    if (!channelAbility[name]) {
      wx.showToast({
        title: '该设备不支持此能力',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
    // 能力集 已在上判断，直接返回  true
    return true;
  },
  /**
   * 对讲功能
   */
  handleTalk() {
    if (!this.checkStatus('AudioTalk')) return;
    // 判断 设备是否在线 & 设备是否具备此能力集
    //  对设备能力集 进行判断 然后继续向下触发
    const that = this;
    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting);
        if (res.authSetting['scope.record']) {
          const { isTalk } = that.data;
          isTalk ? that.handleTalkClose() : that.getTalkPushUrl();
        } else {
          that.authConfirm();
        }
      },
    });
    return;
  },
  getTalkPushUrl() {
    const { deviceId, appSecret, appId, token, channelId, channelAbility } =
      this.data;
    const { isNvr } = channelAbility;
    const params = {
      token,
      deviceId,
      channelId,
      isTalk: true,
      streamId: '0',
      deviceType: isNvr ? 'channel' : 'device',
    };
    console.log('params', params);
    primaryRequest({
      url: 'createDeviceRtmpLive',
      msg: '创建对讲地址中...',
      data: {
        appId,
        appSecret,
        params: params,
      },
      success: (res) => {
        // 判断数据容错机制
        let result = res.data.result;
        if (result.code == '0') {
          const pushUrl = result.data.url;
          console.log(pushUrl, 'pushUrl');
          this.setData({ pushUrl }, () => {
            this.pushcontext.start();
          });
        }
      },
      fail: (res) => {
        console.log('rtmp地址获取失败', res);
      },
    });
  },
  // push
  pusherStateChange: function (e) {
    console.log('>>> live-pusher onPushStateChange:', e.detail.code);
    const code = e.detail.code;
    let content = '';
    switch (code) {
      case 1001:
        console.log('code', code, '已经连接推流服务器');
        break;
      case 1002:
        this.handleTalkSuccess();
        console.log('code', code, '已经与服务器握手完毕,开始推流');
        break;
      case 1003:
        console.log('code', code, '打开摄像头成功');
        break;
      case 1004:
        console.log('code', code, '录屏启动成功');
        break;
      case 1005:
        // 把 这里作为 对讲 建立成功的
        // this.handleTalkSuccess()
        console.log('code', code, '推流动态调整分辨率');
        break;
      case 1006:
        console.log('code', code, '推流动态调整码率');
        break;
      case 1007:
        console.log('code', code, '首帧画面采集完成, 推流成功');
        break;
      case 1008:
        console.log('code', code, '编码器启动');
        break;
      case -1301:
        console.log('code', code, '打开摄像头失败');
        break;
      case -1302:
        console.log('code', code, '打开麦克风失败');
        break;
      case -1303:
        console.log('code', code, '视频编码失败');
        break;
      case -1304:
        console.log('code', code, '音频编码失败');
        break;
      case -1306:
        console.log('code', code, '不支持的音频采样率');
        break;
      case -1307:
        console.log(
          'code',
          code,
          '网络断连，且经多次重连抢救无效，更多重试请自行重启推流'
        );
        content = '网络出错，推流失败';
        break;
      case -1308:
        console.log('code', code, '开始录屏失败，可能是被用户拒绝');
        break;
      case -1309:
        console.log(
          'code',
          code,
          '录屏失败，不支持的Android系统版本，需要5.0以上的系统'
        );
        break;
      case -1310:
        console.log('code', code, '录屏被其他应用打断了');
        break;
      case -1311:
        console.log('code', code, 'Android Mic打开成功，但是录不到音频数据');
        break;
      case -1312:
        console.log('code', code, '录屏动态切横竖屏失败');
        break;
      case 1101:
        console.log('code', code, '网络状况不佳：上行带宽太小，上传数据受阻');
        break;
      case 1102:
        console.log('code', code, '网络断连, 已启动自动重连');
        break;
      case 1103:
        console.log('code', code, '硬编码启动失败,采用软编码');
        break;
      case 1104:
        console.log('code', code, '视频编码失败');
        break;
      case 1105 || 1106:
        console.log('code', code, '新美颜软编码启动失败，采用老的软编码');
        break;
      case 3001:
        console.log('code', code, 'RTMP -DNS解析失败');
        break;
      case 3002:
        console.log('code', code, 'RTMP服务器连接失败');
        break;
      case 3003:
        console.log('code', code, 'RTMP服务器握手失败');
        break;
      case 3004:
        console.log(
          'code',
          code,
          'RTMP服务器主动断开，请检查推流地址的合法性或防盗链有效期'
        );
        break;
      case 3005:
        console.log('code', code, 'RTMP 读/写失败');
        break;
      default:
        console.log('未知错误');
        break;
    }
  },
  //play
  playState: function (e) {
    console.log('playState', e.detail);
    if (e.detail && e.detail.code === 5001) {
      this.data.isTalk ? this.handleTalkClose() : this.pushcontext.stop();
    }
  },
  handlePtzTouchStart: function (event) {
    wx.createSelectorQuery()
      .select('#ptz-img-container')
      .boundingClientRect((rect) => {
        let { clientX, clientY } = event.touches[0];

        let rectLeft = rect.left;
        let rectTop = rect.top;
        let width = 60;
        var centerLeft = 84 + rectLeft;
        var centerTop = 84 + rectTop;

        var left = clientX - centerLeft;
        var top = clientY - centerTop;
        if (
          centerLeft < clientX &&
          clientX < centerLeft + width &&
          centerTop < clientY &&
          clientY < centerTop + width
        ) {
          console.log('xxxxxxx');
          return;
        }
        console.log(
          'rectLeft',
          rectLeft,
          'rectTop',
          rectTop,
          'event.touches[0]',
          event.touches[0]
        );
        console.log('点击了页面方位：pageY', clientY);
        console.log('云盘位置：top', rect.top);
        let ptzStatus = 5;
        if (Math.abs(left) > Math.abs(top)) {
          ptzStatus = left > 0 ? 3 : 2;
        } else {
          ptzStatus = top > 0 ? 1 : 0;
        }
        this.handlePtzControl(ptzStatus);
      })
      .exec();
  },
  handlePtzControl: function (position) {
    let baseUrl = '/image/selfDevice/yuntai/';
    // 设置
    let ptzImgSrc = baseUrl + 'yuntai.png';
    console.log(position, 'position', 'position');
    switch (position) {
      case 0:
        ptzImgSrc = 'yuntai_shang.png';
        break;
      case 1:
        ptzImgSrc = 'yuntai_xia.png';
        break;
      case 2:
        ptzImgSrc = 'yuntai_zuo.png';
        break;
      case 3:
        ptzImgSrc = 'yuntai_you.png';
        break;
    }
    this.setData({ ptzImgSrc: baseUrl + ptzImgSrc });

    const { deviceId, appSecret, appId, token, channelId } = this.data;
    this.requestText = primaryRequest({
      url: 'controlMovePTZ',
      msg: '云台控制移动中...',
      data: {
        appId,
        appSecret,
        params: {
          token,
          deviceId,
          channelId,
          operation: `${position}`,
          // 固定 50 ms
          duration: '5000',
        },
      },
      success: (res) => {
        console.log(res, 'res');
        this.timer = setTimeout(() => {
          this.handlePtzControl(position);
        }, 5000);
      },
    });
  },
  handlePtzTouchEnd(e) {
    clearTimeout(this.timer);
    const { deviceId, appSecret, appId, token, channelId } = this.data;
    this.setData({ ptzImgSrc: '/image/selfDevice/yuntai.png' });
    this.requestText && this.requestText.abort();
    // 发送停止转动的请求接口
    primaryRequest({
      url: 'controlMovePTZ',
      msg: '云台停止移动...',
      data: {
        appId,
        appSecret,
        params: {
          token,
          deviceId,
          channelId,
          operation: '10',
          duration: '5000',
        },
      },
      success: (res) => {
        console.log(res, 'res');
      },
    });
  },
  handlePTZ(e) {
    // 是否进行展示云台控制界面
    if (!this.checkStatus('PT')) return;
    this.setData({
      isPtzPanel: !this.data.isPtzPanel,
    });
  },
  handleTalkSuccess: function () {
    this.setData(
      {
        isTalk: true,
      },
      () => {
        wx.showToast({
          title: '对讲已开启，请讲话',
          icon: 'none',
          duration: 2000,
        });
      }
    );
  },
  handleTalkClose() {
    console.log('关闭对讲中');
    this.setData({ isTalk: false }, () => {
      this.pushcontext.stop();
      wx.showToast({
        title: '对讲关闭',
        icon: 'none',
        duration: 2000,
      });
    });
  },
  authConfirm() {
    const that = this;
    wx.showModal({
      content: '您没打开麦克风，是否去设置打开？',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting['scope.record']) {
                that.getTalkPushUrl();
              } else {
                wx.showToast({
                  title: '您没有授权，无法打开对讲',
                  icon: 'none',
                });
              }
            },
          });
        } else {
          wx.showToast({
            title: '您没有授权，无法打开对讲',
            icon: 'none',
          });
        }
      },
    });
  },
  livePusherError(e) {
    console.log('live-player', e);
    console.error('live-player error:', e.detail.errMsg);
    if (e.detail.errCode == 10001) {
      wx.showToast({
        title: '视频播放或录制需要你手机授权微信录音或麦克风权限',
        icon: 'none',
        duration: 3000,
      });
    }
  },
});
