<template>
  <el-container class="player-container" :style="{width: '100vw', height: '100vh'}">
    <el-main class="main-container">
      <el-col 
        key="col"
        :style="{height: '100%'}"
        :span="24"
        class="player-box active-player"
      >
        <video-player
          :ref="`player`"
          :id="'player'"
          :rtspURL="rtspURL"
          :audioURL="audioURL"
          :downloadURL="downloadURL"
          :isLive="isLive"
          @downloadProgressUpdate="downloadProgressUpdate"
          @playProgressUpdate="playProgressUpdate"
          @downloadComplete="downloadComplete"
          @downloadError="downloadError"
          @playError="playError"
        />
      </el-col>
    </el-main>
    <el-footer height="40px">
      <el-row class="w-100">
        <el-col :span="22" class="h40 flex">
          <div :class="isPause || !isPlay ? 'play-icon' : 'pause-icon'" :title="isPause || !isPlay ? '播放' : '暂停'" @click="togglePlay"></div>
          <div class="screenshot-icon" title="截图" @click="screenshot"></div>
          <div class="recording-icon" :class="{'active': recording}" title="录像" @click="record"></div>
          <div v-show="isLive" class="talk-icon" :class="{'active': talking}" title="对讲" @click="talk"></div>
          <div class="sound-icon" :class="{'active': isMuting}" :title="isMuting ? '静音' : '声音'" @click="toggleMute"></div>
          <div v-show="!isLive" class="download-icon" title="录像下载" @click="download" v-loading="isDownloading"></div>
          <div v-show="!isLive" class="fast-icon" title="倍速" @click="fast"></div>
          <div class="config-set">
            <span class="fn-13 mg-l-5">业务类型：</span>
            <el-select v-model="isLive" size="mini" style="width: 80px;">
              <el-option key="false" :value="false" label="录像"></el-option>
              <el-option key="true" :value="true" label="直播"></el-option>
            </el-select>
            <span class="fn-13 mg-l-5">协议类型：</span>
            <el-select v-model="protoType" size="mini" style="width: 90px;">
              <el-option key="rtsp" value="rtsp" label="rtsp"></el-option>
              <el-option key="rtsv" value="rtsv" label="私有协议"></el-option>
            </el-select>
            <span class="fn-13 mg-l-5">码流类型：</span>
            <el-select v-model="streamType" size="mini" style="width: 80px;">
              <el-option key="0" value="0" label="高清"></el-option>
              <el-option key="1" value="1" label="标清"></el-option>
            </el-select>
            <span v-show="!isLive" class="fn-13 mg-l-5">录像类型：</span>
            <el-select v-show="!isLive" v-model="recordType" size="mini" style="width: 100px;">
              <el-option key="localRecord" value="localRecord" label="本地录像"></el-option>
              <el-option key="cloudRecord" value="cloudRecord" label="云录像"></el-option>
            </el-select>
            <span v-show="!isLive">
              <el-select v-model="speed" size="mini" placeholder="播放倍速" style="width: 100px;">
                <el-option key="0.25" :value="0.25" label="1/4"></el-option>
                <el-option key="0.5" :value="0.5" label="1/2"></el-option>
                <el-option key="1" :value="1" label="1"></el-option>
                <el-option key="2" :value="2" label="2"></el-option>
                <el-option key="4" :value="4" label="4"></el-option>
                <el-option key="6" :value="6" label="6"></el-option>
                <el-option key="8" :value="8" label="8"></el-option>
              </el-select>
              <el-date-picker
                size="mini"
                v-model="recordTimeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="录像开始日期"
                end-placeholder="录像结束日期"
                :clearable="false"
                style="width: 315px;">
              </el-date-picker>
            </span>
            <span class="fn-13 mg-l-5" v-show="isLive">设备类型：</span>
            <el-select v-show="isLive" v-model="deviceType" size="mini" style="width: 110px;">
              <el-option key="channel" value="channel" label="多通道设备"></el-option>
              <el-option key="device" value="device" label="单通道设备"></el-option>
            </el-select>
            <span class="fn-13 mg-l-5">设备序列号：</span>
            <el-input v-model="deviceId" placeholder="请输入设备序列号" size="mini" style="width: 150px;"></el-input>
            <span class="fn-13 mg-l-5">通道号：</span>
            <el-input v-model="channelId" placeholder="请输入通道号" size="mini" style="width: 80px;"></el-input>
          </div>
        </el-col>
        <el-col :span="2" class="text-right h40">
          <span class="video-icon closeall-normal-icon" title="关闭所有" @click="closeVideo"></span>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>
<script>
  import VideoPlayer from '@/components/videoPlayer/VideoPlayer.vue'
  import videoPlay from '@/components/videoPlayer/videoPlay.js'
  import config from '@/common/js/config.js'
  import resetAjax from '@/common/js/ajaxReset'
  export default {
    name: 'videoDemo',
    data() {
      return {
        recording: false,
        talking: false,
        isMuting: true,
        rtspURL: '',
        audioURL: null,
        downloadURL: '',
        isLive: true,
        url: '',
        isPause: false,
        isPlay: false,
        isDownloading: false,
        speed: '',
        recordTimeRange: [],

        recordType: 'localRecord',
        // 加密模式：0 - 不加密，1-加密
        encrypt: '0',
        protoType: 'rtsp',
        deviceType: 'device',
        // 设备序列号
        deviceId: '',
        // 通道号
        channelId: '0',
        // 码流类型：0 - 主码流 1- 辅码流 默认为主码流
        streamType: "0"
      }
    },
    components: {
      VideoPlayer
    },
    methods: {
      screenshot() {
        if (!this.isPlay || this.isPause) {
          this.$message.warning("截图前请先播放视频")
          return
        }
        console.log('-----screenshot-----')
        this.$refs[`player`] && this.$refs[`player`].screenshot()
      },
      playError(e) {
        console.error(e)
      },
      recordError(){
        console.error(e)
        this.recording = false
      },
      closeVideo() {
        console.log('-----closeVideo-----')
        this.isPlay = false
        this.isPause = false
        this.talking = false
        this.isMuting = true
        this.isDownloading = false
        this.recording = false
        this.rtspURL = ''
        this.$refs[`player`] && this.$refs[`player`].close()
      },
      async record() {
        if (!this.isPlay || this.isPause) {
          this.$message.warning("录像前请先直播")
          return
        }
        if (!this.recording) {
          await this.init()
        }
        this.recording = !this.recording
        this.$refs[`player`] && this.$refs[`player`].record()
      },
      talk() {
        if (!this.talking) {
          if (!this.isPlay || this.isPause) {
            this.$message.warning("对讲前请先直播")
            return
          }
          if (!this.deviceId) {
            this.$message.warning("设备序列号不能为空")
            return
          }
          if (!this.channelId) {
            this.$message.warning("通道号不能为空")
            return
          }
          const param = {
            "deviceId": this.deviceId,
            "channelId": this.channelId,
            "businessType": "talk",
            "streamType": this.streamType,
            "encryptMode": this.encrypt,
            "protoType": this.protoType,
            // 多通道设备：channel,单通道设备：device或者空
            "deviceType": this.deviceType
          }
          fetch(`${config.base_url}/gateway/videobussiness/api/createDeviceStreamUrl`, {
            method: 'POST',
            body: JSON.stringify(param),
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + this.token
            },
          }).then(res => {
            return res.json()
          }).then(data => {
            const url = data.data && data.data.url
            if (url) {
              this.audioURL = url
              this.$nextTick(() => {
                this.talking = !this.talking
                this.$refs[`player`] && this.$refs[`player`].talk()
              })
            } else {
              this.$message.warning(data.errMsg)
            }
          })
        } else {
          this.talking = !this.talking
          this.$refs[`player`] && this.$refs[`player`].talk()
        }
      },
      toggleMute() {
        if (this.talking) {
          this.$message.warning("对讲时不能操作声音")
          return
        }
        this.isMuting = !this.isMuting
        const voiceVal = this.isMuting ? 0 : 1
        this.$refs[`player`] && this.$refs[`player`].setAudioVolume(voiceVal)
      },
      play() {
        this.$refs[`player`] && this.$refs[`player`].play()
      },
      pause() {
        this.$refs[`player`] && this.$refs[`player`].pause()
      },
      start() {
        this.$refs[`player`] && this.$refs[`player`].start()
      },
      async togglePlay() {
        if (!this.isPlay) {
          if (!this.deviceId) {
            this.$message.warning("设备序列号不能为空")
            return
          }
          if (!this.channelId) {
            this.$message.warning("通道号不能为空")
            return
          }
          if (!this.isLive && (this.recordTimeRange === null || this.recordTimeRange.length < 2)) {
            this.$message.warning("录像时间不能为空")
            return
          }
          await this.init()
          this.isPlay = true
          this.play()
        } else if (this.isPause) {
          this.isPause = false
          this.start()
        } else {
          this.isPause = true
          this.pause()
        }
      },
      fast() {
        if (!this.isPlay || this.isPause) {
          this.$message.warning("倍速前请先播放录像")
          return
        }
        const speed = this.speed ? this.speed : 1
        this.$refs[`player`] && this.$refs[`player`].playFF(speed)
      },
      playProgressUpdate(msg) {
        // console.log('----------当前播放的时间片段------------:', msg.time)
      },
      async download() {
        if (this.isDownloading) {
          console.log('录像正在下载中......')
          return
        }
        await this.downloadInit()
        this.isDownloading = true
        this.$refs[`player`] && this.$refs[`player`].download()
      },
      downloadProgressUpdate(msg) {
        console.log('------当前录像下载到的时间片段--------:', msg.size, msg.time)
      },
      downloadComplete() {
        console.log('---------下载完成----------')
        this.isDownloading = false
      },
      downloadError(e) {
        console.log(`下载出错，errorCode：${e && e.errorCode},description：${e && e.description}`)
        // 出错时停止下载
        this.$refs[`player`] && this.$refs[`player`].download()
        this.isDownloading = false
      },
      downloadInit() {
        let param = {
            deviceId: this.deviceId,
            channelId: this.channelId,
            streamType: this.streamType,
            protoType: this.protoType,
            encryptMode: this.encrypt,
        }
        param.businessType = this.recordType
        param.beginTime = this.toAllStringByTime(this.recordTimeRange[0])
        param.endTime = this.toAllStringByTime(this.recordTimeRange[1])
        const that = this
        return new Promise((resolve, reject) => {
          resetAjax({
            method: 'post',
            url: `${config.base_url}/gateway/videobussiness/api/createDeviceStreamUrl`,
            data: param,
            needRequestData: true,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + this.token
            },
            onSuccess (res) {
              const url = res.data && res.data.url
              if (url) {
                that.downloadURL = url
                resolve()
              } else {
                that.$message.warning(res.errMsg)
                reject(res.errMsg)
              }
            },
            onError (err) {
              console.error(err)
              reject(err)
            }
          })
        })
      },
      /**
       * 将getTime的值转为yyyy-mm-dd hh:mm:ss格式
       * @param {Number} time 源时间
       */
      toAllStringByTime(timeNum) {
          const time = {}
          let date = new Date(timeNum)
          time.y = this.addZero(date.getFullYear())
          time.m = this.addZero(date.getMonth() + 1)
          time.d = this.addZero(date.getDate())
          time.h = this.addZero(date.getHours())
          time.min = this.addZero(date.getMinutes())
          time.s = this.addZero(date.getSeconds())
          return `${time.y}-${time.m}-${time.d} ${time.h}:${time.min}:${time.s}`
      },
      /**
       * add Zero 月日时分秒补0函数
       */
      addZero: (time) => {
          let newTime = time > 9 ? time : '0' + time
          return newTime
      },
      init() {
        let param = {
            deviceId: this.deviceId,
            channelId: this.channelId,
            streamType: this.streamType,
            protoType: this.protoType,
            encryptMode: this.encrypt,
        }
        if (this.isLive) {
            param.businessType = "real"
        } else {
          param.businessType = this.recordType
          param.beginTime = this.toAllStringByTime(this.recordTimeRange[0])
          param.endTime = this.toAllStringByTime(this.recordTimeRange[1])
        }
        
        return new Promise((resolve, reject) => {
          fetch(`${config.base_url}/gateway/videobussiness/api/createDeviceStreamUrl`, {
            method: 'POST',
            body: JSON.stringify(param),
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + this.token
            },
          }).then(res => {
            return res.json()
          }).then(data => {
            const url = data.data && data.data.url
            if (url) {
              this.rtspURL = url
              resolve()
            } else {
              const errMsg = data.code == 'DV1019' ? '设备能力级不支持！' : data.errMsg
              this.$message.warning(errMsg)
              reject(errMsg)
            }
          })
        })
      },
      /**
       * 获取云睿开放平台token
      */
      getToken() {
        this.token = '88b3ffbe-d44d-464e-8732-3c60c4ab129b'
        // const url = `${config.base_url}/gateway/auth/oauth/token?grant_type=client_credentials&scope=server&client_id=${config.client_id}&client_secret=${config.client_secret}`
        // fetch(url, {
        //   headers: {
        //     'Access-Control-Allow-Origin': '*',
        //     'Content-Type': 'application/x-www-form-urlencoded'
        //   },
        //   method: 'POST'
        // }).then(res => {
        //     return res.json()
        // }).then(data => {
        //   console.log(data)
        //   this.token = data.access_token
        // })
      },
    },
    mounted() {
      this.recordTimeRange = [new Date(), new Date()]
      this.getToken()
      // 初始化播放器，自定义开发必须引入
      videoPlay.init([this.$refs[`player`]])
    },
  }
</script>
<style lang="scss">
  @import '@/components/videoPlayer/index.scss';
  .el-loading-spinner {
    margin-top: -12px;
    .circular {
      height: 21px;
      width: 21px;
    }
  }
</style>
