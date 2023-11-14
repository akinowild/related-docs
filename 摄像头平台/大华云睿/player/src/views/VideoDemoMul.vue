<template>
  <el-container class="shop-video player-container" :style="{width: '100vw', height: '100vh'}">
      <el-aside :width="asideWidth" class="mgb30">
          <ul class="left-ul" :style="{width: asideWidth}">
              <li class="left-li float-l active">
                  <span>通道</span>
                  <span class="current-icon"></span>
              </li>
          </ul>
          <div class="video-tree">
              <div class="input-box-client">
                  <el-input v-model="searchKey" placeholder="请输入关键字过滤" size="mini"></el-input>
              </div>
              <p class="tree-root" @click="toggleExpand">
                <i class="el-icon-caret-bottom" v-show="isExpand"></i>
                <i class="el-icon-caret-right" v-show="!isExpand"></i>
                <span>通道列表</span>
              </p>
              <ul class="channel-tree lighter-scroll-bar" v-show="isExpand">
                <li v-for="item in showChannelList" :key="item.deviceId + item.channelId" :title="item.channelName" @dblclick="dblclickChannel(item)"
                  :class="{'active-channel': windowMap.get(activeWindowNo) && (windowMap.get(activeWindowNo).channelName === item.channelName)}">
                  <i v-if="playingNodes.includes(item.deviceId + item.channelId)" class="playing-icon"></i>
                  <i v-else class="online-icon"></i>
                  {{item.channelName}}
                </li>
                <el-alert v-if="deviceLoaded && !showChannelList.length" :closable="false" title="没有找到节点" type="warning" show-icon></el-alert>
              </ul>
          </div>
      </el-aside>
      <el-container>
          <el-main id="cBox" ref="cBox" class="main-container video-box relative">
            <div v-for="no in 4" :key="'window' + no" class="player-box" :class="{'active-player': no === activeWindowNo}" 
              :style="{width: 100/(stepLength+1) +'%', height: 100/(stepLength+1) +'%'}" @click="changeWindow(no)" @dblclick="dblclickWindow(no, $event)">
               <video-player
                :ref="`player${no}`"
                :id="`player${no}`"
                :rtspURL="rtspURL[no]"
                :audioURL="audioURL[no]"
                :downloadURL="downloadURL[no]"
                :isLive="isLive[no]"
                @downloadComplete="downloadComplete(no)"
                @downloadError="downloadError($event, no)"
                @playError="playError"
              />
            </div>
          </el-main>
          <el-row class="w-precent-100 h40 el-footer">
              <el-col :span="12" class="h40 flex" v-if="windowMap.get(activeWindowNo) && windowMap.get(activeWindowNo).showTool">
                  <div v-show="!isLive[activeWindowNo]" :class="isPause || !isPlay ? 'play-icon' : 'pause-icon'" :title="isPause || !isPlay ? '播放' : '暂停'" @click="togglePlay"></div>
                  <div class="screenshot-icon" title="截图" @click="screenshot"></div>
                  <div class="recording-icon" :class="{'active': recording}" title="录像" @click="record"></div>
                  <div v-show="isLive[activeWindowNo]" class="talk-icon" :class="{'active': talking}" title="对讲" @click="talk"></div>
                  <div class="sound-icon" :class="{'active': isMuting}" :title="isMuting ? '静音' : '声音'" @click="toggleMute"></div>
                  <span v-show="isLive[activeWindowNo]" class="tool-span w34" :title="streamType === '0' ? '切换标清' : '切换高清'" @click="switchStreamType">
                      {{streamType === '0' ? '高清' : '标清'}}</span>
                  <div v-show="!isLive[activeWindowNo]" class="download-icon" title="录像下载" @click="download" v-loading="isDownloading"></div>
                  <div class="close-icon" title="关闭" @click="closeVideo"></div>
                  <el-dropdown v-show="!isLive[activeWindowNo]" class="video-tool-dropdown" placement="bottom-end" @command="fast">
                      <span class="el-dropdown-link" title="播放倍数">
                          {{speed}}X<i class="el-icon-arrow-down el-icon--right"></i>
                      </span>
                      <el-dropdown-menu slot="dropdown" class="video-monitor-dropdown" size="mini">
                          <el-dropdown-item command="0.25">0.25X</el-dropdown-item>
                          <el-dropdown-item command="0.5">0.5X</el-dropdown-item>
                          <el-dropdown-item command="1">1X</el-dropdown-item>
                          <el-dropdown-item command="2">2X</el-dropdown-item>
                          <el-dropdown-item command="4">4X</el-dropdown-item>
                          <el-dropdown-item command="6">6X</el-dropdown-item>
                          <el-dropdown-item command="8">8X</el-dropdown-item>
                      </el-dropdown-menu>
                  </el-dropdown>
              </el-col>
              <el-col :span="12" class="h40" v-else></el-col>
              <el-col :span="12" class="text-right h40">
                  <span class="tool-span w34 switch-record" :title="recordType === 'cloudRecord' ? '切换设备录像' : '切换云录像'" @click="switchRecordType">
                      {{recordType === 'cloudRecord' ? '云' : '设备'}}</span>
                  <span class="p4-normal-icon video-icon" @click="stepLengthInput(0)" title="1分屏"></span>
                  <span class="p16-normal-icon video-icon" @click="stepLengthInput(1)" title="4分屏"></span>
                  <span class="video-icon closeall-normal-icon" title="关闭所有" @click="closeAllVideo"></span>
              </el-col>
          </el-row>
          <div class="timeline-div">
              <i class="el-icon-arrow-left" @click="prev"></i>
              <span class="inline-block w30">{{dateArr[1]}}月</span>
              <div class="inline-block date-panel">
                  <p v-for="item in dayNum" :key="item" class="w-precent-3 inline-block">
                      <span class="time-point" :class="item === dateArr[2] ? 'time-point-active' : ''" @click="timePointClick(item)">{{item | dealZero}}</span>
                  </p>
              </div>
              <i class="el-icon-arrow-right" @click="next"></i>
              <div class="inline-block select-date w140">
                  <el-date-picker v-model="selectDate" class="select-date" type="datetime" placeholder="选择日期" 
                    @change="updateDateArr($event, true)" value-format="yyyy-MM-dd HH:mm:ss" default-time="12:00:00"></el-date-picker>
              </div>
          </div>
          <el-footer height="104px" class="relative timeline-footer">
              <div class="timeline-no">
                  <p v-for="item in screenNum[screenNum.length - 1]" class="timeline-no-p" :key="'p'+item" :class="activeWindowNo === item ? 'font-red' : ''">
                      <span class="timeline-no-span">{{item}}</span>
                      <span class="timeline-title" :title="windowMap.get(item) ? windowMap.get(item).channelName : ''">
                          {{windowMap.get(item) ? windowMap.get(item).channelName : ''}}
                      </span>
                  </p>
              </div>
              <timer v-for="item in screenNum[screenNum.length - 1]" :ref="'timerRef'+item" :key="'timer'+item" @timer-change="timerChange($event, item, true)" :record-infos="recordInfoObj[item]"></timer>
          </el-footer>
      </el-container>
  </el-container>
</template>
<script>
import VideoPlayer from '@/components/videoPlayer/VideoPlayer.vue'
import Timer from '@/components/timer.vue'
import config from '@/common/js/config.js'
import videoPlay from '@/components/videoPlayer/videoPlay.js'
import resetAjax from '@/common/js/ajaxReset'
export default {
  name: "VideoDemoMul",
  data() {
    return {
      // 窗口map，key为窗口号，从1开始，value为窗口信息，包括窗口的设备信息、通道信息、播放状态等等
      windowMap: new Map(), 
      // 支持的屏幕数组下标值
      stepLength: 1,
      // 支持的屏幕数组
      screenNum: [1, 4],
      // 清晰度模式
      definitionMode: 1,
      // 通道map，key为channelId，value为通道信息
      channelMap: new Map(), 
      // 当前激活的窗口号，从1开始
      activeWindowNo: 1,
      asideWidth: '205px',
      // 选择的日期时间
      selectDate: '',
      // 选择的日期数组，格式[年, 月, 日]
      dateArr: [],
      // 录像片段信息，用于传值给时间轴组件，设置录像片段背景
      recordInfoObj: {},
      timerChangeFn: null,
      loading: false,
      // 录像查看后是否需要回放
      needPlayBack: true, 
      // 播放倍数，默认1倍数
      multiple: 1,
      // 录像日期
      recordDate: '',
      // 设备品牌信息
      brand: 'general',
      // 播放中的结点，用于模糊查询后更新图标 
      playingNodes: [],
      //乐橙token
      lcToken: '',
      searchKey: '',
      //是否无节点
      noNode: false,
      channelList: [],
      isExpand: true,
      // 设备已加载完成
      deviceLoaded: false,

      rtspURL: {
        1: '',
        2: '',
        3: '',
        4: ''
      },
      audioURL: {
        1: '',
        2: '',
        3: '',
        4: ''
      },
      downloadURL: {
        1: '',
        2: '',
        3: '',
        4: ''
      },
      isLive: {
        1: true,
        2: true,
        3: true,
        4: true
      },
      recording: false,
      talking: false,
      isMuting: true,
      isPause: false,
      isPlay: false,
      isDownloading: false,
      recordType: 'localRecord',

      speed: 1,
      // 加密模式：0 - 不加密，1-加密
      encrypt: '0',
      // 码流类型：0 - 主码流 1- 辅码流 默认为主码流
      streamType: "0"
    }
  },
  components: {
    VideoPlayer,
    Timer
  },
  computed: {
      // 当前选择月份的天数
      dayNum() {
          if (this.dateArr.length > 0) {
              return new Date(this.dateArr[0], this.dateArr[1], 0).getDate()
          } else {
              return 0
          }
      },
      showChannelList() {
        return this.channelList.filter(item => item.channelName.includes(this.searchKey))
      }
  },
  filters: {
      // 日期补0
      dealZero(val) {
          return val <= 9 ? '0' + val : val
      }
  },
  methods: {
    toggleExpand() {
      this.isExpand = !this.isExpand
    },
    changeWindow(no) {
      if (no === this.activeWindowNo) return
      // 切换窗口前，关闭当前窗口声音
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].setAudioVolume(0)
      // 切换窗口前，如果当前窗口处于对讲，要先结束对讲
      if (this.talking) {
        this.talking = false
        this.windowMap.get(this.activeWindowNo).talking = false
        this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].talk()
      }

      this.activeWindowNo = no
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (winInfo && winInfo.showTool) {
        this.isMuting = winInfo.isMuting
        this.recording = winInfo.recording
        this.talking = winInfo.talking
        this.isPause = winInfo.isPause
        this.isPlay = winInfo.isPlay
        this.streamType = winInfo.streamType
        this.isDownloading = winInfo.isDownloading
        this.speed = winInfo.speed ? winInfo.speed : 1
        this.recordType = winInfo.recordType
        !winInfo.isMuting && this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].setAudioVolume(1)
      }
    },
    dblclickWindow(no, e) {
      // 1分屏没有双击放大功能
      if (this.stepLength === 0) {
        return
      }
      this.changeWindow(no)
      $(e.target).parents(".player-box").toggleClass("full-player-box").siblings().toggleClass("none")
    },
    dblclickChannel(item) {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      // 移除上一次窗口的播放信息
      if (winInfo) {
        this.playingNodes = this.playingNodes.filter(item => item !== (winInfo.deviceId + winInfo.channelId))
      }
      this.windowMap.set(this.activeWindowNo, {
        deviceId: item.deviceId,
        channelId: item.channelId,
        channelName: item.channelName,
        onlineStatus: item.onlineStatus,
        channelAbility: item.channelAbility,
        deviceAbility: item.deviceAbility,
        deviceModel: item.deviceModel,
        deviceType: item.deviceType,
        protoType: item.protoType,
        recordProtoType: item.recordProtoType,
        talkProtoType: item.talkProtoType,
        streamType: '0'
      })
      this.closeVideo()

      const date = new Date().Format("yyyy-MM-dd")
      this.updateDateArr(`${date} 12:00:00`)
      this.playReal()
    },
    checkRecord(param, beginTime, endTime) {
      let winInfo = this.windowMap.get(param.windowNo)
      endTime = endTime ? endTime : beginTime.split(" ")[0] + " 23:59:59"
      let data = {pageNum: 1, pageSize: 30, deviceId: param.deviceId, channelId: param.channelId, windowNo: param.windowNo, beginTime: new Date(beginTime).getTime(), endTime: new Date(endTime).getTime()}
      const that = this
      return new Promise((resolve, reject) => {
        resetAjax({
            method: 'post',
            url: `${config.base_url}/gateway/device/api/${winInfo.recordType === 'cloudRecord' ? 'getCloudVideoRecords' : 'getVideoLocalRecords'}`,
            data: data,
            needRequestData: true,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + this.token
            },
            onSuccess (res) {
              let pageData = res.data.pageData
              let windowInfo = that.windowMap.get(res.requestData.windowNo)
              // 接口返回的streamType码流类型（main：主码流；extra1：辅码流）
              if (pageData.length && pageData[0].streamType === 'extra1') {
                windowInfo.recordStreamType = '1'
              } else {
                windowInfo.recordStreamType = '0'
              }
              that.$set(that.recordInfoObj, res.requestData.windowNo, res.data.pageData)
              resolve()
            },
            onError (err) {
              console.error(err)
              reject(err)
            }
        })
      })
    },
    /**
     * @method stepLengthInput() 视频窗口数目的变化
     */
    stepLengthInput(length) {
      this.stepLength = length
      // 1分屏要切换到第一个窗口
      if (this.stepLength === 0) {
        this.activeWindowNo != 1 && this.changeWindow(1)
        this.$nextTick(() => {
          $(".player-box").eq(0).siblings().addClass("none")
        })
      } else {
        $(".player-box").removeClass("none")
      }
    },
    /**
    * @method setWindowTime() 设置窗口时间 yyyy-MM-dd HH:mm:ss 
    */
    setWindowTime(windowNo, time) {
        if (this.windowMap.get(windowNo)) {
            this.windowMap.get(windowNo)['time'] = time
        }
    },
    /**
    * @method getWindowTime() 获取窗口时间
    */
    getWindowTime(num) {
        if (this.windowMap.get(num)) {
            return this.windowMap.get(num)['time']
        } else {
            return null
        }
    },
    /**
     * @method prev() 上个月
     */
    prev() {
        if (this.dateArr[1] === 1) {
            this.$set(this.dateArr, '1', 12)
            this.$set(this.dateArr, '0', this.dateArr[0] - 1)
        } else {
            this.$set(this.dateArr, '1', this.dateArr[1] - 1)
        }
        this.timePointClick(this.dayNum)
    },

    /**
     * @method next() 下个月
     */
    next() {
        if (this.dateArr[1] === 12) {
            this.$set(this.dateArr, '1', 1)
            this.$set(this.dateArr, '0', this.dateArr[0] + 1)
        } else {
            this.$set(this.dateArr, '1', this.dateArr[1] + 1)
        }
        this.timePointClick(this.dayNum)
    },

    /**
    * @method timePointClick() 点击时间点
    */
    async timePointClick(item) {
        this.$set(this.dateArr, '2', item)
        this.updateSelectDate()
        let positionTime = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 12:00:00`
        this.$refs['timerRef'+this.activeWindowNo][0].positionTime(new Date(positionTime).getTime())

        let winInfo = this.windowMap.get(this.activeWindowNo)
        if (winInfo) {
          // 点击时间点的时候去查录像
          let startTime = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 00:00:00`
          await this.checkRecord({deviceId: winInfo.deviceId, channelId: winInfo.channelId, windowNo: this.activeWindowNo}, startTime)
        }
        this.timerChange("12:00:00", this.activeWindowNo, true)
    },
    /**
    * @method updateSelectDate() 更新选择的日期时间
    */
    updateSelectDate() {
        this.selectDate = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 12:00:00`
        this.setWindowTime(this.activeWindowNo, this.selectDate)
    },
    /**
    * @method updateDateArr() 更新日期数组
    */
    async updateDateArr(dateStr, needPlayback) {
        let date = dateStr.split(" ")[0]
        let time = dateStr.split(" ")[1]
        let arr = date.split("-")
        for (let index = 0; index < arr.length; index++) {
            this.$set(this.dateArr, index, parseInt(arr[index]))
        }
        let num = this.activeWindowNo
        this.$refs['timerRef'+num][0].positionTime(new Date(dateStr).getTime())
        let preTime = this.getWindowTime(num)
        this.setWindowTime(num, dateStr)
        
        const winInfo = this.windowMap.get(num)
        if (!winInfo) {
          return
        }
        if (!preTime || (preTime != null && preTime.split(" ")[0] != date)) {
          // 切换时间的时候日期有变化才去查录像，不是每次切换都去查
            let startTime = `${date} 00:00:00`
            await this.checkRecord({deviceId: winInfo.deviceId, channelId: winInfo.channelId, windowNo: this.activeWindowNo}, startTime)
        }
        this.timerChange(time, num, needPlayback)
    },
    /**
     * @method timerChange() 时间点变化
     */
    async timerChange(time, num, needPlayback) {
      const winInfo = this.windowMap.get(num)
      if (winInfo && needPlayback) {
        winInfo.isPlayback = true
        winInfo.recordType = winInfo.recordType || 'localRecord'
        winInfo.beginTime = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} ${time}`
        winInfo.endTime = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 23:59:59`
        await this.init(num)
        winInfo.isPlay = true
        this.activeWindowNo === num && (this.isPlay = true)
        this.play(num)
      }
    },
    /**
     * @method switchStreamType() 切换码流类型
     */
    switchStreamType() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (winInfo != null) {
        this.closeVideo()
        this.streamType = this.streamType === '0' ? '1' : '0'
        winInfo.streamType = this.streamType
        this.playReal()
      }
    },
    /**
     * @method switchRecordType() 切换录像类型，录像类型 localRecord - 本地录像 cloudRecord - 云录像
     */
    async switchRecordType() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (winInfo != null) {
        winInfo.recordType = winInfo.recordType === 'cloudRecord' ? 'localRecord' : 'cloudRecord'
        this.recordType = winInfo.recordType

        let startTime = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 00:00:00`
        await this.checkRecord({deviceId: winInfo.deviceId, channelId: winInfo.channelId, windowNo: this.activeWindowNo}, startTime)
        this.timerChange('00:00:00', this.activeWindowNo, true)
      } 
    },

    screenshot() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (!winInfo) {
        return
      }
      if (!winInfo.isPlay || winInfo.isPause) {
        this.$message.warning("截图前请先播放视频")
        return
      }
      console.log('-----screenshot-----')
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].screenshot()
    },
    playError(e) {
      console.error(e)
    },
    recordError(){
      console.error(e)
    },
    closeVideo(windowNo) {
      windowNo = windowNo || this.activeWindowNo
      console.log('-----closeVideo-----')
      let winInfo = this.windowMap.get(windowNo)
      if (winInfo) {
        winInfo.isPlay = false
        winInfo.isPause = false
        winInfo.talking = false
        winInfo.isMuting = true
        winInfo.isDownloading = false
        winInfo.recording = false
        winInfo.streamType = '0'
        let key = winInfo.deviceId + winInfo.channelId
        this.playingNodes = this.playingNodes.filter(item => item !== key)
        winInfo.showTool = false
      }
      if (windowNo === this.activeWindowNo) {
        this.isPlay = false
        this.isPause = false
        this.isDownloading = false
        this.talking = false
        this.isMuting = true
        this.isDownloading = false
        this.recording = false
      }
      this.$refs[`player${windowNo}`][0] && this.$refs[`player${windowNo}`][0].close()
    },
    closeAllVideo() {
      console.log('-----closeAllVideo-----')
      for (let index = 1; index <= this.screenNum[this.screenNum.length - 1]; index++) {
        let winInfo = this.windowMap.get(index)
        if (winInfo) {
          winInfo.isPlay = false
          winInfo.isPause = false
          winInfo.talking = false
          winInfo.isMuting = true
          winInfo.isDownloading = false
          winInfo.recording = false
          winInfo.streamType = '0'
          winInfo.showTool = false
          this.playingNodes = []
        }
        this.$refs[`player${index}`][0] && this.$refs[`player${index}`][0].close()
      }
    },
    async record() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (!winInfo) {
        return
      }
      if (!winInfo.isPlay || winInfo.isPause) {
        this.$message.warning("录像前请先直播")
        return
      }
      if (!winInfo.recording) {
        await this.init(this.activeWindowNo)
      }
      winInfo.recording = !winInfo.recording
      this.recording = winInfo.recording
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].record()
    },
    talk() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (!winInfo) {
        return
      }
      if (!winInfo.talking) {
        if (!winInfo.isPlay || winInfo.isPause) {
          this.$message.warning("对讲前请先直播")
          return
        }
        const param = {
          "deviceId": winInfo.deviceId,
          "channelId": winInfo.channelId,
          "businessType": "talk",
          "streamType": this.streamType,
          "encryptMode": this.encrypt,
          "protoType": winInfo.talkProtoType,
          // 多通道设备：channel,单通道设备：device或者空
          "deviceType": winInfo.deviceType,
          windowNo: this.activeWindowNo
        }
        const that = this
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
            const requestWindowNo = res.requestData.windowNo
            if (url) {
              that.audioURL[requestWindowNo] = url
              that.$nextTick(() => {
                that.windowMap.get(requestWindowNo).talking = true
                that.talking = true
                that.$refs[`player${requestWindowNo}`][0] && that.$refs[`player${requestWindowNo}`][0].talk()
              })
            } else {
              that.$message.warning(res.errMsg)
            }
          }
        })
      } else {
        winInfo.talking = !winInfo.talking
        this.talking = winInfo.talking
        this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].talk()
      }
    },
    toggleMute() {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (!winInfo) {
        return
      }
      if (winInfo.talking) {
        this.$message.warning("对讲时不能操作声音")
        return
      }
      winInfo.isMuting = !winInfo.isMuting
      this.isMuting = winInfo.isMuting
      const voiceVal = winInfo.isMuting ? 0 : 1
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].setAudioVolume(voiceVal)
    },
    play(windowNo) {
      this.$refs[`player${windowNo}`][0] && this.$refs[`player${windowNo}`][0].play()
    },
    pause() {
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].pause()
    },
    start() {
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].start()
    },
    async playReal() {
      await this.init(this.activeWindowNo)
      let winInfo = this.windowMap.get(this.activeWindowNo)
      this.playingNodes.push(winInfo.deviceId + winInfo.channelId)
      winInfo.isPlay = true
      this.isPlay = true
      this.play(this.activeWindowNo)
    },
    async togglePlay() {
      if (this.isPause) {
        this.start()
      } else {
        this.pause()
      }
      let winInfo = this.windowMap.get(this.activeWindowNo)
      winInfo.isPause = !winInfo.isPause
      this.isPause = winInfo.isPause
    },
    fast(command) {
      let winInfo = this.windowMap.get(this.activeWindowNo)
      if (!winInfo.isPlay || winInfo.isPause) {
        this.$message.warning("倍速前请先播放录像")
        return
      }
      this.speed = parseFloat(command, 10)
      winInfo.speed = this.speed
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].playFF(this.speed)
    },
    // playProgressUpdate(msg) {
      // console.log('----------当前播放的时间片段------------:', msg.time)
    // },
    async download() {
      if (this.isDownloading) {
        console.log('录像正在下载中......')
        return
      }
      await this.downloadInit(this.activeWindowNo)
      this.isDownloading = true
      let winInfo = this.windowMap.get(this.activeWindowNo)
      winInfo.isDownloading = true
      this.$refs[`player${this.activeWindowNo}`][0] && this.$refs[`player${this.activeWindowNo}`][0].download()
    },
    // downloadProgressUpdate(msg, windowNo) {
    //   console.log('------当前录像下载到的时间片段--------:', windowNo, msg.size, msg.time)
    // },
    downloadError(e, windowNo) {
      console.log(`窗口${windowNo}下载出错，errorCode：${e && e.errorCode},description：${e && e.description}`)
      // 出错时停止下载
      this.$refs[`player${windowNo}`][0] && this.$refs[`player${windowNo}`][0].download()
      let winInfo = this.windowMap.get(windowNo)
      winInfo && (winInfo.isDownloading = false)
      if (windowNo == this.activeWindowNo) {
        this.isDownloading = false
      }
    },
    downloadComplete(windowNo) {
      console.log(`窗口${windowNo}下载完成`)
      let winInfo = this.windowMap.get(windowNo)
      winInfo && (winInfo.isDownloading = false)
      if (windowNo == this.activeWindowNo) {
        this.isDownloading = false
      }
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
    init(windowNo) {
      let winInfo = this.windowMap.get(windowNo)
      let param = {
          deviceId: winInfo.deviceId,
          channelId: winInfo.channelId,
          encryptMode: this.encrypt,
          windowNo: windowNo
      }
      if (winInfo.isPlayback) {
        param.businessType = winInfo.recordType
        param.protoType = winInfo.recordProtoType
        param.beginTime = winInfo.beginTime
        param.endTime = winInfo.endTime
        param.streamType = winInfo.recordStreamType || '0'
      } else {
        param.protoType = winInfo.protoType
        param.businessType = "real"
        param.streamType = winInfo.streamType
      }
      this.isLive[windowNo] = !winInfo.isPlayback
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
            let windowInfo = that.windowMap.get(res.requestData.windowNo)
            // 重新拉流停止上一次正在下载的流
            windowInfo && windowInfo.isDownloading && that.$refs[`player${res.requestData.windowNo}`][0] && that.$refs[`player${res.requestData.windowNo}`][0].download()
            if (url) {
              that.rtspURL[res.requestData.windowNo] = url
              windowInfo.isPause = false
              windowInfo.talking = false
              windowInfo.isMuting = true
              windowInfo.isDownloading = false
              windowInfo.recording = false
              windowInfo.showTool = true
              if (res.requestData.windowNo == this.activeWindowNo) {
                that.isDownloading = false
              }
              resolve()
            } else {
              that.rtspURL[res.requestData.windowNo] = ''
              that.closeVideo(res.requestData.windowNo)
              that.$message.warning(res.errMsg)
              reject(res.errMsg)
            }
          },
          onError (err) {
            console.error(err)
            reject(err)
            if (err.requestData) {
              let windowInfo = that.windowMap.get(err.requestData.windowNo)
              that.playingNodes = that.playingNodes.filter(item => item !== (windowInfo.deviceId + windowInfo.channelId))
            }
          }
        })
      })
    },
    downloadInit(windowNo) {
      let winInfo = this.windowMap.get(windowNo)
      let param = {
          deviceId: winInfo.deviceId,
          channelId: winInfo.channelId,
          streamType: winInfo.streamType,
          encryptMode: this.encrypt,
          windowNo: windowNo
      }
      param.businessType = winInfo.recordType
      param.protoType = winInfo.recordProtoType
      param.beginTime = winInfo.beginTime
      param.endTime = winInfo.endTime
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
              that.downloadURL[res.requestData.windowNo] = url
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
     * 获取云睿开放平台token
    */
    getToken() {
      const url = `${config.base_url}/gateway/auth/oauth/token?grant_type=client_credentials&scope=server&client_id=${config.client_id}&client_secret=${config.client_secret}`
      const that = this
      resetAjax({
        method: 'post',
        url: url,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        onSuccess (res) {
          that.token = res.access_token
          that.initDeviceList()
        }
      })
    },
    // 初始化通道列表
    initDeviceList(searchKey) {
      const that = this
      resetAjax({
        method: 'post',
        url: `${config.base_url}/gateway/device/api/page`,
        data: {pageNum: 1, pageSize: 200, searchKey: searchKey},
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token
        },
        onSuccess (res) {
          let responseData = res.data.pageData
          that.channelList = []
          responseData.length && responseData.forEach(device => {
            let hasRtsv = false
            if (device.ability) {
              let abilitys = device.ability.split(",")
              hasRtsv = abilitys.includes("TSV1") || abilitys.includes("TSV2")
            }
            device.channelList && device.channelList.forEach(channel => {
            // 只展示在线通道
            channel.onlineStatus && that.channelList.push({
                channelId: channel.channelId,
                channelName: channel.channelName,
                onlineStatus: channel.onlineStatus,
                channelAbility: channel.channelAbility,
                protoType: device.ability && device.ability.includes("RTSV") ? 'rtsv' : 'rtsp',
                recordProtoType: device.ability && device.ability.includes("PBSV") ? 'rtsv' : 'rtsp',
                talkProtoType: hasRtsv ? 'rtsv' : 'rtsp',
                deviceId: device.deviceId,
                deviceAbility: device.ability,
                deviceModel: device.deviceModel,
                deviceType: device.deviceModel && device.deviceModel.includes("NVR") ? 'channel' : 'device'
              })
            })
          })
          this.deviceLoaded = true
        }
      })
    }
  },
  mounted() {
    this.getToken()
    let now = new Date();
    // dateArr格式：[年, 月, 日]
    this.dateArr = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    this.selectDate = `${this.dateArr[0]}-${this.addZero(this.dateArr[1])}-${this.addZero(this.dateArr[2])} 12:00:00`
    
    let players = []
    for (let index = 1; index <= this.screenNum[this.screenNum.length - 1]; index++) {
      this.$refs[`player${index}`] && players.push(this.$refs[`player${index}`][0])
    }
    // 初始化播放器，自定义开发必须引入
    videoPlay.init(players)
  }
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
.shop-video {
  /* 火狐 */
  -moz-user-select: none;
  /* Safari 和 欧朋 */
  -webkit-user-select: none;
  /* IE10+ and Edge */
  -ms-user-select: none;
  /* (谷歌) */
  user-select: none;
  .video-tree {
    height: calc(100% - 37px);
    .tree-root {
      font-size: 13px;
      text-align: left;
      margin-bottom: 5px;
      margin-left: 5px;
      cursor: pointer;
      .el-icon-caret-bottom, .el-icon-caret-right {
        font-size: 20px;
        vertical-align: top;
      }
    }
    .online-icon, .playing-icon {
      background: url("@/components/videoPlayer/img/online.png");
      background-size: 100% 100%;
      width: 20px;
      height: 15px;
      display: inline-block;
      vertical-align: sub;
      margin: 0 3px;
    }
    .playing-icon {
      background: url("@/components/videoPlayer/img/conline.png");
      background-size: 100% 100%;
    }
  }
  .channel-tree {
    height: calc(100% - 76px);
    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 8px;
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(144,147,153,.3);
        border-radius: 5px;
    }
    li {
      margin-left: 15px;
      cursor: pointer;
      height: 30px;
      line-height: 30px;
      color: #333;
      background-color: rgba(0,0,0,0);
      text-decoration: none;
      vertical-align: top;
      max-width: 155px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      text-align: left;
    }
  }
  .active-channel {
    background-color: #feeaea!important;
    color: #f23838!important;
  }
  .player-box {
    float: left;
    box-sizing: border-box;
  }
  .full-player-box {
    width: 100% !important;
    height: 100% !important;
  }
  .none {
    display: none;
  }
  .p4-normal-icon {
    right: 76px !important;
  }
}
  .el-container {
    height: 100%;
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
  }

  .el-header {
      background: transparent;
      color: #fff;
      text-align: center;
      line-height: 60px;
      position: relative;
      z-index: 10;
  }

  html .el-main, body .el-main {
      padding: 0;
  }

  .relative {
      position: relative;
  }

  .text-right {
      text-align: right;
  }

  .float-l {
      float: left;
  }

  ul {
      list-style: none;
      margin: 0;
      padding: 0;
  }

  .inline-block {
      display: inline-block;
  }

  .el-dialog__body {
      padding: 20px;
  }

  .w30 {
      width: 30px;
  }

  .w34 {
      width: 34px;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;
  }

  .w140 {
      width: 140px;
  }

  .w-precent-100 {
      width: 100%;
  }

  .w-precent-3 {
      width: 3%;
  }

  .h40 {
      height: 40px;
  }

  .mg-t-15 {
      margin-top: 15px;
  }

  .mg-0 {
      margin: 0px;
  }

  .el-icon-arrow-left, .el-icon-arrow-right {
      width: 25px;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
      font-size: 15px;
      cursor: pointer;
  }

  .select-date {
      height: 25px;
      width:138px !important;
  }

  .date-panel {
      width: calc(100% - 240px);
      text-align: left;
  }

  .input-box-client {
      width: 90%;
      margin: 5px auto;
  }

  .el-input input {
      border-radius: 0;
      border: 1px solid #d1d2d3;
      color: #2e2c2c;
      font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB";
  }

  i.tree-search-icon {
      position: absolute;
      cursor: pointer;
      top: 7px;
      right: 1px;
      width: 16px;
      height: 16px;
      display: inline-block;
      background: url(@/components/videoPlayer/img/search-N.png) no-repeat;
      
  }
  i.tree-search-icon:hover {
      background: url(@/components/videoPlayer/img/search-H.png) no-repeat;
  }
  i.tree-search-icon {
      transition: unset;
  }

  .video-tool-dropdown {
    line-height: 40px;
    margin-left: 10px;
  }
  .video-monitor-dropdown {
    padding: 5px 0;
    .el-dropdown-menu__item {
      line-height: 30px;
      padding: 0 18px;
    }
  }

  .el-slider-step {
      width:100px;
      display:inline-block;
      position:absolute;
      right:185px;
  }

  .timeline-div {
      height: 25px;
      line-height: 25px;
      margin: 0;
      width: 100%;
      background: #fff;
      border-top: 1px solid #ddd;
      font-size: 13px;
  }
  .timeline-div p, .timeline-main {
      margin: 0;
  }
  .time-point {
      cursor: pointer;
      border-radius: 50%;    
      display: inline-block;
      width: 20px;
      height: 20px;
      text-align: center;
      line-height: 20px;
  }
  .time-point-active {
      background: red;
      color: #fff;
  }
  .timeline-no {
      position: absolute;
      left: 11px;
  }
  .timeline-no-p {
      margin: 0;
      height: 26px;
      line-height: 26px;
      color: #999;
  }
  .font-red {
      color: red;
  }
  .timeline-no-span {
      display: inline-block;
      width: 17px;
      overflow: hidden;
  }
  .timeline-title {
      width: 85px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
  }

  .select-date .el-input__icon {
      line-height: 25px;
  }
  .select-date .el-input__inner {
      height: 25px;
      line-height: 25px;
      border: none;
  }
  .el-time-panel {
      left: -30px;
  }
  .record-date-form .el-form-item {
      margin-bottom: 15px;
  }

  .tool-span {
      padding: 3px 5px;
      border-radius: 2px;
      background: #6D6F72;
      color: #fff;
      margin-left: 15px;
      font-size: 10px;
      display: inline-block;
      position: relative;
      top: 9px;
      height: 22px;
  }

  .tool-span:hover {
      background: #F23838;
  }

  .switch-record {
    right: 35px;
    top: 5px;
  }

  .tooltip-style {
      overflow: visible;
      width: 208px;
  }

  .tooltip-style .title {
      font-weight: bold;
      margin-bottom: 10px;
      line-height: 20px;
  }

  .tooltip-style .content {
      line-height: 20px;
  }
  .shop-video {
    color: #2e2c2c;
}

.shop-video .timeline-footer {
    background-color: #ebeced;
    bottom: 0;
    border-top: 1px solid #ddd;
    padding: 0;
    overflow-y: hidden;
}

.shop-video .el-container {
    border: 1px solid #ddd;
    border-top: 0;
}

.el-aside {
    background-color: #fff;
    position: relative;
    overflow: hidden;
}
.left-ul {
    overflow: initial;
    height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #f23838;
    position: relative;

    
}
.left-ul .active {
    color: #2e2c2c;
    position: relative;
}
.current-icon {
    position: absolute;
    bottom: -2px;
    left: 35px;
    margin-left: -6px;
    width: 12px;
    height: 8px;
    background: url(@/components/videoPlayer/img/up-icon.png)
}
.left-li {
    width: 33%;
    color: #666;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
}
.left-li:hover {
    color: #2e2c2c;
}
</style>
