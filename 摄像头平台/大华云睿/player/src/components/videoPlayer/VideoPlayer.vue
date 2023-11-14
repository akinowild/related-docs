<template>
  <div :id="id" class="video-player">
    <canvas
      :ref="`download-${id}`"
      class="kind-stream-canvas video-player-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></canvas>
    <canvas
      :ref="`downloadIvs-${id}`"
      class="kind-stream-canvas video-player-canvas"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></canvas>
    <canvas
      :ref="`talk-${id}`"
      class="kind-stream-canvas video-player-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></canvas>
    <canvas
      :ref="`talkIvs-${id}`"
      class="kind-stream-canvas video-player-canvas"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></canvas>
    <canvas
      :ref="`can-${id}`"
      class="kind-stream-canvas video-player-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      :style="{ visibility: isPlay ? 'visible' : 'hidden' }"
    ></canvas>
    <canvas
      :ref="`ivsCan-${id}`"
      class="kind-stream-canvas video-player-canvas"
      width="1920"
      height="1080"
      :style="{ visibility: isPlay ? 'visible' : 'hidden' }"
    ></canvas>
    <video
      :ref="`video-${id}`"
      class="kind-stream-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      :style="{ visibility: isPlay ? 'visible' : 'hidden' }"
    ></video>
    <video
      :ref="`download-video-${id}`"
      class="kind-stream-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></video>
    <video
      :ref="`talk-video-${id}`"
      class="kind-stream-canvas"
      kind-channel-id="0"
      width="1920"
      height="1080"
      style="visibility: hidden"
    ></video>
    <img :src="loading" v-if="isLoading" />
  </div>
</template>
<script>
  import PlayerControl from './playerWasm/PlayerControl.js'
  import loading from './img/loading.png'
  export default {
    props: {
      id: {
        type: String,
        default: Date.now().toString()
      },
      rtspURL: {
        type: String,
        required: true,
      },
      audioURL: {
        type: String,
      },
      // 录像下载url
      downloadURL: {
        type: String,
      },
      channelId: {
        type: Number || String,
        default: 0,
      },
      // 主辅码流 0 主码流 1 辅码流
      bitStream: {
        type: Number,
        default: 0,
      },
      isLive: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        player: null,
        playerPort: null,
        talkPlayer: null,
        talkPort: null,
        recordPlayer: null,
        loading: loading,
        // 是否在加载中
        isLoading: false,
        downloadPlayer: null,
        downloadPlayerPort: null,
        // 是否在播放
        isPlay: false,
        // 是否在录像中
        isRecording: null,
        isPrivateProtocol: false,
        timer: null,
        volume: 0,
      }
    },
    watch: {
      rtspURL(val) {
        this.isPrivateProtocol = val.includes('rtsp://') ? false : true
      },
      audioURL(val) {
        this.isPrivateProtocol = val.includes('rtsp://') ? false : true
      },
      downloadURL(val) {
        this.isPrivateProtocol = val.includes('rtsp://') ? false : true
      }
    },
    computed: {
      wsURL() {
        const { protocol } = location
        const [ wsIP ] = this.rtspURL.replace('rtsp://', '').split('/')
        const ws = `${protocol === 'http:' && !this.rtspURL.includes('8556') ? 'ws' : 'wss'}://${wsIP}`
        return !this.isPrivateProtocol ? ws : `${ws}/httpprivateoverwebsocket`
      },
      audioWsURL() {
        const { protocol } = location
        const [ wsIP ] = this.audioURL.replace('rtsp://', '').split('/')
        const ws = `${protocol === 'http:' && !this.audioURL.includes('8556') ? 'ws' : 'wss'}://${wsIP}`
        return !this.isPrivateProtocol ? ws : `${ws}/httpprivateoverwebsocket`
      },
      downloadWsURL() {
        const { protocol } = location
        const [ wsIP ] = this.downloadURL.replace('rtsp://', '').split('/')
        const ws = `${protocol === 'http:' && !this.downloadURL.includes('8556') ? 'ws' : 'wss'}://${wsIP}`
        return !this.isPrivateProtocol ? ws : `${ws}/httpprivateoverwebsocket`
      },
      rtspStream() {
        const rtsp = this.rtspURL.includes('rtsp://') ? this.rtspURL : `rtsp://${this.rtspURL}`
        return !this.isPrivateProtocol ? (this.isLive ? rtsp : rtsp.replace(/&beginTime=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}&endTime=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '')) :
                                            (this.isLive ? `/live/realmonitor.xav?channel=${this.channelId}&subtype=${this.bitStream}` : `/vod/playback.xav?channel=${this.channelId}&subtype=${this.bitStream}`)
      },
      downloadStream() {
        const rtsp = this.downloadURL.includes('rtsp://') ? this.downloadURL : `rtsp://${this.downloadURL}`
        return !this.isPrivateProtocol ? (this.isLive ? rtsp : rtsp.replace(/&beginTime=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}&endTime=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '')) :
                                            (this.isLive ? `/live/realmonitor.xav?channel=${this.channelId}&subtype=${this.bitStream}` : `/vod/playback.xav?channel=${this.channelId}&subtype=${this.bitStream}`)
      },
      audioStream() {
        const audioURL = this.audioURL.includes('rtsp://') ? this.audioURL : `rtsp://${this.audioURL}`
        return !this.isPrivateProtocol ? audioURL : `/live/talk.xav?channel=${this.channelId}&subtype=${this.bitStream}`
      },
      sourceId() {
        return this.rtspURL.replace('rtsp://', '').split('/')[1]
      },
      audioSourceId() {
        return this.audioURL.replace('rtsp://', '').split('/')[1]
      },
      downloadSourceId() {
        return this.downloadURL.replace('rtsp://', '').split('/')[1]
      },
    },
    methods: {
      /**
       * @method play 直播播放
       */
      play() {
        if (!this.rtspURL) return
        if (this.player) {
          this.player.close()
        }
        let firstTime = 0
        const options = {
          wsURL: this.wsURL,
          rtspURL: this.rtspStream,
          sourceId: this.sourceId,
          lessRateCanvas: true,
          // 当前是直播or回放
          playback: this.isLive === false,
          isPrivateProtocol: this.isPrivateProtocol,
          // demo默认空字符串,实际应为设备登录时返回的realm
          realm: '',
        }
        this.player = new PlayerControl(options)
        this.timer = setTimeout(() => {
          this.isLoading = false
          this.$emit('playError', {
            errorCode: 500,
          })
        }, 10000)
        this.isLoading = true
        this.player.on('ResolutionChanged', (e) => {
          console.log('-------------ResolutionChanged--------------:', e)
        })
        this.player.on('PlayStart', () => {
          this.isPlay = true
          if (this.isLoading) this.isLoading = false
        })
        this.player.on('DecodeStart', (e) => {
          clearTimeout(this.timer)
          this.isPlay = true
          if (this.isLoading) this.isLoading = false
          if (e.decodeMode === 'video') {
            this.$refs[`can-${this.id}`].style.display = 'none'
            this.$refs[`video-${this.id}`].style.display = ''
          } else {
            this.$refs[`can-${this.id}`].style.display = ''
            this.$refs[`video-${this.id}`].style.display = 'none'
          }
        })
        this.player.on('UpdateCanvas', (e) => {
          // console.log('-----------UpdateCanvas------------', e)
          if (firstTime === 0) {
            firstTime = e.timeStamp
          }
          const playTime = (e.timeStamp - firstTime) / 1000
          const msg = {
            playTime: playTime,
            time: e.timeStamp,
          }
          this.$emit('playProgressUpdate', msg)
        })
        this.player.on('GetFrameRate', (e) => {
          console.log('-------------GetFrameRate--------------:', e)
        })
        this.player.on('FrameTypeChange', (e) => {
          console.log('-------------FrameTypeChange--------------:', e)
        })
        this.player.on('Error', (e) => {
          this.isPlay = false
          this.$emit('playError', e)
          // this.player.close()
          // this.player = null
        })
        this.player.on('IvsDraw', (e) => {
          console.log('-------------IvsDraw--------------:', e)
        })
        this.player.on('WorkerReady', () => {
          this.player.connect()
        })
        this.player.init(this.$refs[`can-${this.id}`], this.$refs[`video-${this.id}`], this.$refs[`ivsCan-${this.id}`])
        this.player.connect()
        this.playerPort = this.player.getPlayPort()
      },
      /**
       * @method openIVS 开启智能帧
       */
      openIVS() {
        this.player && this.player.openIVS()
      },
      /**
       * @method closeIVS 关闭智能帧
       */
      closeIVS() {
        this.player && this.player.closeIVS()
      },
      /**
       * @method talk 对讲
       */
      talk() {
        const optionsAudio = {
          // rtsp对讲
          wsURL: this.audioWsURL,
          rtspURL: this.audioStream,
          sourceId: this.audioSourceId,
          isTalkService: true,
          isPrivateProtocol: this.isPrivateProtocol,
          // demo默认空字符串,实际应为设备登录时返回的realm
          realm: '',
        }
        if (this.talkPlayer) {
          this.talkPlayer.talk('off')
          this.talkPlayer = null
        } else {
          this.talkPlayer = new PlayerControl(optionsAudio)
          this.talkPlayer.talk(
            'on',
            this.$refs[`talk-${this.id}`],
            this.$refs[`talk-video-${this.id}`],
            this.$refs[`talkIvs-${this.id}`],
            !this.isPlay,
          )
          if (!this.isPlay) this.talkPort = this.talkPlayer.getPlayPort()
          this.talkPlayer.on('Error', (e) => {
            this.$emit('talkError', e)
          })
        }
      },
      download(fileName) {
        const optionsRecord = {
          wsURL: this.downloadWsURL,
          rtspURL: this.downloadStream,
          sourceId: this.downloadSourceId,
          lessRateCanvas: true,
          playback: true,
          isPrivateProtocol: this.isPrivateProtocol,
          // demo默认空字符串,实际应为设备登录时返回的realm
          realm: '',
          isDownloadService: true,
        }
        if (!this.downloadPlayer) {
          this.downloadPlayer = new PlayerControl(optionsRecord)
          this.downloadPlayer.on('Error', (e) => {
            this.$emit('downloadError', e)
          })
          this.downloadPlayer.on('recordChanged', (e) => {
            if (e.type == 'pendding' && e.time) {
              const msg = {
                size: e.size,
                time: e.time,
              }
              this.$emit('downloadProgressUpdate', msg)
            } else if (e.type == 'closed') {
              this.$emit('downloadComplete')
              this.downloadPlayer = null
            }
          })
          this.downloadPlayer.download(
            this.$refs[`download-${this.id}`],
            this.$refs[`download-video-${this.id}`],
            this.$refs[`downloadIvs-${this.id}`],
            fileName,
          )
          this.downloadPlayer.connect()
          this.downloadPlayerPort = this.downloadPlayer.getPlayPort()
          this.downloadPlayer.startRecord(fileName || Date.now() + '.mp4')
        } else {
          this.downloadPlayer.stopRecord()
        }
      },
      /**
       * @method record 录像
       */
      record(fileName) {
        if (!this.player) return
        if (!this.isRecording) {
          this.isRecording = true
          this.player.startRecord(fileName || Date.now() + '.mp4')
        } else {
          this.isRecording = false
          this.player.stopRecord()
        }
      },
      /** 
       * @method screenshot 截图
       */
      screenshot() {
        this.player && this.player.capture(Date.now(), this.$refs[`can-${this.id}`])
      },
      /** 
       * @method close 视频关闭
       */
      close() {
        if (this.talkPlayer) {
          this.talkPlayer.talk('off')
          this.talkPlayer = null
        }
        clearTimeout(this.timer)
        this.player && this.player.close()
        this.isPlay = false
        this.isLoading = false
        this.player = null
        this.$emit('update:rtspURL', '')
      },
      /** 
       * @method setAudioVolume 声音设置
       */
      setAudioVolume(val) {
        if (!window.webAudioPlayer) {
          let intervalId = setInterval(() => {
            if (window.webAudioPlayer) {
              window.webAudioPlayer.resume()
              clearInterval(intervalId)
            }
          })
        } else {
          window.webAudioPlayer.resume()
        }
        this.volume = val
        this.player && this.player.setAudioVolume(val)
        this.talkPlayer && this.talkPlayer.setAudioVolume(val)
      },
      /** 
       * @method pause 暂停拉流
       */
      pause() {
        this.player && this.player.pause()
      },
      /** 
       * @method start 继续拉流
       */
      start() {
        this.player && this.player.continue()
      },
      /**
       * @method downloadPause 暂停下载
       */
      downloadPause() {
        this.downloadPlayer && this.downloadPlayer.pause()
      },
      /**
       * @method downloadStart 继续下载
       */
      downloadStart() {
        this.downloadPlayer && this.downloadPlayer.continue()
      },
      /**
       * @method downloadClose 关闭下载
       */
      downloadClose() {
        this.downloadPlayer && this.downloadPlayer.close()
        this.downloadPlayer.cancelRecord()
        this.downloadPlayer = null
      },
      /** 
       * @method playFF 快进/快退
       */
      playFF(speed) {
        this.player && this.player.playFF(speed)
      },
      cPlusVisibleDecCallBack(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo) {
        if (nPort == this.playerPort) {
          this.player && this.player.setFrameData(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo, this.volume)
        }
        if (nPort == this.downloadPlayerPort) {
          this.downloadPlayer &&
          this.downloadPlayer.setFrameData(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo, 0)
        }
        if (nPort == this.talkPort) {
          this.talkPlayer && this.talkPlayer.setFrameData(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo, this.volume, true)
        }
      },
      cDigitalSignCallBack(nPort, nFrameID, bSuccess) {
        if (nPort == this.playerPort) {
          this.player && this.player.setDecryptionResult(nPort, nFrameID, bSuccess)
        }
        if (nPort == this.downloadPlayerPort) {
          this.downloadPlayer && this.downloadPlayer.setDecryptionResult(nPort, nFrameID, bSuccess)
        }
      },
      cExtraDrawDataCallBack(nPort, nDataType, pDrawData, nDataLen) {
        if (nPort == this.playerPort) {
          this.player && this.player.setIVSData(nPort, nDataType, pDrawData, nDataLen)
        }
        if (nPort == this.downloadPlayerPort) {
          this.downloadPlayer && this.downloadPlayer.setIVSData(nPort, nDataType, pDrawData, nDataLen)
        }
      },
      cExtraDrawDrawCallBack(nPort) {
        if (nPort == this.playerPort) {
          this.player && this.player.drawIVSData(nPort)
        }
        if (nPort == this.downloadPlayerPort) {
          this.downloadPlayer && this.downloadPlayer.drawIVSData(nPort)
        }
      },
      cRecordDataCallBack(nPort, pData, nDataLen, nOffset, pRecordFrameInfo) {
        if (nPort == this.playerPort) {
          this.player && this.player.setRecordData(nPort, pData, nDataLen, nOffset, pRecordFrameInfo)
        }
        if (nPort == this.downloadPlayerPort) {
          this.downloadPlayer &&
          this.downloadPlayer.setRecordData(nPort, pData, nDataLen, nOffset, pRecordFrameInfo)
        }
      }
    }
  }
</script>
<style lang="scss">
  .video-player {
    width: 100%;
    height: 100%;
    position: relative;
    .video-player-canvas {
      position: absolute;
      top: 0;
    }
    canvas {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
    video {
      width: 100%;
      height: 100%;
      top: 0;
      object-fit: fill;
    }
    img {
      width: 479px;
      height: 178px;
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>