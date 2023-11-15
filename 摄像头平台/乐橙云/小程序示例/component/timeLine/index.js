// component/timeLine/index.js
import { getHourMiSe } from '../../utils/util'
// 时间 与 偏移量的 关系


/**
 * 规定一下 时间规定 UTC， 时间上报 为偏移量
 * 此 时间进度条组件 执行以下几件事
 * 1. records 为非空数组， 迭代刷新进度条数据
 * 2. records 为空数组， 则清空数据，停止数据
 */
Component({
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
    // 日期修改
    packDate: {
      type: String,
      observer: function(newValue){
        // 日期修改 重新生成渲染的 records
        this.timer && clearInterval(this.timer)
        // 时间修改为 UTC & 首部偏移 在此更新
        this.oneTime = (new Date(`${newValue}T00:00:00Z`)).getTime()
        // console.log('pack date change',this.oneTime.getTime())
      }
    },
    // 考虑异步 渲染的情况
    /**
     * 假如 为 空数组，则将所有的进度条进行清空
     * 非空数组，则相关进度条数据不动，仅同步渲染进度条数据
     */
    records:{
      type: Array,
      value: [],
      observer: function(newValue,oldValue){
        // 步进长度为空
        if(newValue.length === 0){
          clearInterval(this.timer)
          // 步进长度不用更新
          // 数组为空 则向上 触发 调整播放器状态
          this.status = {
            ...this.status,
            time: null,
            timeIndex: 0,
          }
          // 立即清空
          this.setData({ timeRecords:[], left:0, date: '00:00:00' })
          this.createSelectorQuery().select('#time-line-item').boundingClientRect((res)=>{
             // 获取 宽度 更新步长
            this.status.one = res.width/27/60/60
            // 数据上报 老的数值也为 [] 则认为为空的数组
            // if(oldValue.length === 0)
            this.triggerEvent('userChange', { date: '00:00:00'})
          }).exec()
        }else{
            // 假如老值 是 空数组，则 说明是第一次渲染 是否可以考虑
            this.status = {
              ...this.status,
              time: null,
              timeIndex: 0,
            }
            // 将 left 移动到第一个left
            this.createSelectorQuery().select('#time-line-item').boundingClientRect((res)=>{
              // 获取 宽度 更新步长
            this.status.one = res.width/27/60/60
            console.log('this.oneTIme',this.oneTime)
            const records = newValue.map(item =>({
              ...item,
              left: Math.floor((item.beginTimeS - this.oneTime)/1000)*this.status.one,
              width: Math.floor((item.endTimeS - item.beginTimeS)/1000)*this.status.one
            }))
            // 更新进度条
            this.status.time = records[0].beginTimeS
            const date = getHourMiSe(this.status.time)
            this.setData({timeRecords: records, left: records[0].left, date: date})
            // 向上触发时间，以触发播放器进行播放
            // 第一次渲染，可以考虑不向上触发，以第一次为空值向上报为准
            this.triggerEvent('userChange', { date: date})
          }).exec()
        }
      }
    },
    packType:{
      type: Boolean,
      value: 1,
    },
    state:{
      type:Number,
      observer:function(newValue){
        if(newValue === 1){
          this.beginTimeScroll()
        }else if(newValue === 0){
          this.stopTimeScroll()
        }
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    lines: [],
    left: 0,
    time: 0,
    date: '00:00:00',
    timeRecords: [],
    beginLeft: 0,  // 初始偏移长度
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindscroll({detail}){
      console.log('bindscroll',detail)
    },
    _binddragend(detail){
      clearInterval(this.timer)
      // 假如 records 值 为空
      if(this.data.timeRecords.length === 0 ){
        this.setData({timeRecords:[],left:0,date:'00:00:00'})
        return
      }
      // 滚动事件，200ms之后获取值，便于值正确
      setTimeout(() => {
        this.createSelectorQuery().select('#time-line-item').boundingClientRect((res)=>{
          // 容器宽度 // 以 此 left 的偏移角度 为时间戳 进行计算时间的偏移量
          console.log('this.width', res.left) // left 为 负值，实际上使用时设置为ture
          let left  = Math.abs(res.left)
          // left 不可用，拖拽出现的中间无录像片段，自动贴近下一段
          for(let i=0;i<this.data.timeRecords.length;i++){
            if((left < this.data.timeRecords[i].left + this.data.timeRecords[i].width )){
              if(left < this.data.timeRecords[i].left || this.data.packType){
                // 中间 & 云录像，贴近这一段 开头
                left = this.data.timeRecords[i].left
                console.log('packType', this.data.packType)
              }
              this.status.timeIndex = i;
              break;
            }
          }
          // 将 left 处于 one
          this.status.time =  this.oneTime + (left / this.status.one)*1000
          // 修改偏移量
          const date  = getHourMiSe(this.status.time)
          this.setData({left: left, date: date})
          // 上传时间 并触发更新
          this.triggerEvent('userChange', { date: date})
        }).exec()
      }, 500)

    },
    _bindtouchMove(detail){
      clearInterval(this.timer)
      console.log('_bindtouchMove',detail)
    },
    // 开始滚动进度条
    beginTimeScroll(){
      clearInterval(this.timer)
      this.timer = setInterval(()=>{
          // 步进数
            const {  one } = this.status
            // 下进一秒， 步进 要考虑 视频进秒的跳动性
            this.status.time += 1000
            let left  = this.data.left + one
            // 需要判断 此时 left 是否大于 右边界
            // 如果 timeIndex 大于 records 的length 中止滚动条
            if(this.status.timeIndex >= this.data.timeRecords.length) clearInterval(this.timer)
            if(this.status.time > this.data.timeRecords[this.status.timeIndex].endTimeS){
                this.status.timeIndex += 1
                left = this.data.timeRecords[this.status.timeIndex].left
                this.status.time =  this.data.timeRecords[this.status.timeIndex].beginTimeS
            }
            this.setData({left: left, date: getHourMiSe(this.status.time)})
            this.triggerEvent('timeChange',{ date: getHourMiSe(this.status.time)})
      },1000)
    },
    stopTimeScroll(){
      clearInterval(this.timer)
    },
    // 获取左侧数据
    getLeftTime(){
      const left = this.data.left
      for(let i=0;i<this.data.timeRecords.length;i++){
        if((left < this.data.timeRecords[i].left + this.data.timeRecords[i].width )){
            let  letNew = this.data.timeRecords[i].left
            // 将 left 处于 one
            this.status.time =  this.oneTime + (letNew / this.status.one)*1000
            // 修改偏移量
            const time = getHourMiSe(this.status.time)
            this.setData({left: letNew, date: time})
            return time
        }
      }
    }
  },
  lifetimes:{
    attached: function(){
      // 此天 凌晨的 时间戳
      const date = ['','','']
      for(let i=0;i<24;i++){
        if(i<=9){
          date.push(`0${i}:00`)
          date.push(`0${i}:30`)
        }else{
          date.push(`${i}:00`)
          date.push(`${i}:30`)
        }
      }
      date.push('')
      date.push('')
      date.push('')
      this.setData({lines: date})
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      clearInterval(this.timer)
    },
    ready: function () {
      // 获取 左侧偏移角度
    }
  }
})
