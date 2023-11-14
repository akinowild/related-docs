## 使用方式

把 playerWasm 和 WasmLib 引入到 public(公共资源目录)，并引入播放组件 VideoPlayer(src\components\videoPlayer)，附带 VideoDemo.vue(单窗口) 和VideoDemoMul.vue(多窗口)作为组件使用的样例模板

使用VideoPlayer组件的业务页面必须进行播放器初始化，如下所示：
import videoPlay from '@/components/videoPlayer/videoPlay.js'
videoPlay.init([player])

## 支持程度

支持 web 端 websocket + rtsp 以及 websocket + http 私有流，两种播放模式，支持 H264/H265 播放

| 功能 | websocket + rtsp | websocket + http 私有流 |
| ---- | ---------------- | ----------------------- |
| 直播 | 支持 | 支持 |
| 截图 | 支持 | 支持 |
| 直播实时录像 | 支持 | 支持 |
| 直播对讲 | 支持 | 支持 |
| 静音 | 支持 | 支持 |
| 录像倍速 | 支持 | 支持 |
| 录像下载 | 支持 | 支持 |

## API

| 参数              | 说明                           | 类型    | 默认值       |
| ----------------- | ------------------------------ | ------- | ------------ |
| id                | 组件 id                        | string  | 时间戳字符串 |
| rtspURL           | 直播/录像流地址                     | string  |              |
| downloadURL       | 录像下载地址                     | string  |              |
| audioURL          | 对讲流地址                     | string  |              |
| isLive            | 是否是直播                     | boolean | true         |

特别说明：API中三个地址必须使用大华云睿开放平台“创建设备流地址”接口进行获取（https://www.cloud-dahua.com/gateway/videobussiness/api/createDeviceStreamUrl）

## 方法

| 名称           | 描述                                           |
| -------------- | ---------------------------------------------- |
| play           | 直播/录像播放                                  |
| talk           | 直播对讲                                       |
| record         | 实时录像                                       |
| screenshot     | 视频截图                                       |
| close          | 视频关闭播放                                   |
| setAudioVolume | 设置视频声音（0-1）                            |
| pause          | 视频暂停                                       |
| start          | 视频继续播放                                   |
| playFF         | 录像倍速设置（0.25，0.5，1，1.5，2，4，8，16） |
| download       | 录像下载                                       |
| downloadPause       | 暂停下载                                       |
| downloadStart       | 继续下载                                       |
| downloadClose       | 结束下载，会导出当前已经下载完成的文件          |

## 事件

| 事件名称 | 说明 | 回调参数 |
| ------- | ---- | ------- |
| downloadProgressUpdate | 录像下载过程中触发的回调函数，返回当前下载的录像片段时间戳 time 和片段大小 size | (msg) => void |
| downloadComplete | 录像下载完成的回调函数 | () => void |
| playProgressUpdate | 播放过程中触发的回调函数，返回当前播放的录像片段时间戳 time 和播放时间 playTime （单位：s） | (msg) => void |
| playError | 播放过程中出现错误触发的回调函数 | (err) => void |
| talkError | 对讲过程中出现错误触发的回调函数 | (err) => void |
| downloadError | 录像下载过程中出现错误触发的回调函数 | (err) => void |
| recordError | 实时录像过程中出现错误触发的回调函数 | (err) => void |
