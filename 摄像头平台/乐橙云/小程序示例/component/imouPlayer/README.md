# imouPlayer 使用说明
## 实现逻辑:
使用乐橙开放平台 [createDeviceFlvLive](https://open.imou.com/book/zh/http/device/live/createDeviceFlvLive.html) 和 [queryDeviceFlvLive](https://open.imou.com/book/zh/http/device/live/queryDeviceFlvLive.html) 获取设备的 flv 协议地址，使用微信的 live-player 组件进行播放。

## 依赖
1. live-player 的使用前提，参考： [live-player 微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/live-player.html)
2. https://openapi.lechange.cn 配置为 合法域名
## 使用
1. 将 代码源码 imouPlayer.zip 下载 并 放在 小程序 component 文件夹中
1. 在 页面的 json 文件中引入
```json
{
  "usingComponents": {
     "imou-player":"/component/imouPlayer/imouPlayer"
  }
}
```
2. 页面的 wxml 文件中使用

```js
<imou-player-live
  id="imou-player"
  appId="xxxxxx"
  appSecret="xxxxxx"
  token="xxxxxxx"
  deviceId="xxxxxxxxxxxxxxx"
  channelId="0"
  type="0"
  recordType="1"
	bind:error="handleError"
/>
```
### 属性
| 字段     | 类型    | 必填 | 说明           |
| -------- | ------- | ---- | -------------- |
| appId | string  | Yes  | 拥有设备权限的appId      |
| appSecret      | string  | Yes  | 拥有设备权限的appSecret   |
| token | string | Yes   | 拥有设备权限的 accessToken |
| deviceId | string | Yes   | 设备序列号   |
| channelId   | string  | Yes   | 设备通道号 |
| styleConfig | object | No | 播放器宽高 |
|type|number|No| 直播或者录播 1为直播，0为录播，默认为1|
|recordType|number|No| 录像 1 为云录像 0为本地录像 默认为 1|
|error|事件属性，使用方式 bind:error|No|组件错误事件上浮|
### API
此组件可使用 [this.selectComponent](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/events.html#%E8%8E%B7%E5%8F%96%E7%BB%84%E4%BB%B6%E5%AE%9E%E4%BE%8B) 的方式进行获取 组件实例，调用实例的方法。

| 函数名     | 说明    |
| -------- | ------- | 
| snapshot | 截图，由 live-player 组件 的 snapshot 完成，截图只要在视频播放过程中有效  | 

#### 截图示例
```js
onReady: function () {
  // 获取 palyer
  this.player = this.selectComponent('#imou-player');
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
```