
<template>
  <div :ref="'timeline-' + guid" :id="'timeline-' + guid" class="timeline" ondragstart="return false;" onselectstart="return false;">
    <p class="timeline-line"></p>
    <div
      ref="timeline-main"
      class="timeline-main"
      :key="'timeline-main-' + guid"
      :id="'timeline-main-' + guid"
    >
      <!-- 时间段 -->
      <span
        v-for="item in timeArr"
        :key="item + guid"
        :class="'timeline-text-' + guid"
        :style="{ paddingRight: paddingRight + 'px' }"
        >{{ item }}</span>
      <!-- 录像片段的背景，层级-1 -->
      <div class="record-bg-div">
        <span class="record-bg-span" v-for="(record, index) in recordRange" :key="index + guid" :style="{ left: record.left + 'px', width: record.width + 'px' }"></span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 时间段数组，不同时间间隔，时间段的数量和值都是不同的
      timeArr: [],
      // 时间间隔范围对应的下标
      intervalNum: 6,
      // 时间间隔范围对应的秒数，从1分钟到2小时
      intervalArr: [60, 300, 600, 900, 1800, 3600, 7200],
      paddingRight: 50,
      timer: null,
      // 时间轴所选时间，默认显示12点的位置
      selectTime: null,
      guid: "",
      parentWidth: 0,
      resizeFn: null,
      // 录像片段的区间信息，包括开始时间结束时间，左边距和宽度
      recordRange: [],
      // 上次背景设置日期
      lastBgSetDate: '',
      timerChange: null
    };
  },
  props: {
    // 录像片段
    recordInfos: {
      type: Array,
      default() {
        return []
      }
    }
  },
  watch: {
    // 所选时间变化，触发父页面时间点变化方法
    selectTime: {
      handler(val) {
        if (val) {
          this.timerChange()
        }
      },
    },
    // 录像片段变化时，重新设置背景
    recordInfos: {
      deep: true,
      handler(val) {
        if (val && val.length > 0) {
          // windowTime格式：2021-07-02 12:10:30
          // this.lastBgSetDate = val[0].windowTime.split(" ")[0]
          this.setBackground(val)
        } else {
          this.recordRange = []
        }
      }
    }
  },
  computed: {
    // 最小右间距
    minRight() {
      return Math.ceil(this.parentWidth * 0.03);
    },
    // 最大右间距
    maxRight() {
      return Math.ceil(this.parentWidth * 0.09);
    },
  },
  methods: {
    // 时间秒数格式化
    secToTime(s) {
      s = Math.floor(s)
      var t;
      if (s > -1) {
        var hour = Math.floor(s / 3600);
        var min = Math.floor(s / 60) % 60;
        var sec = s % 60;
        if (hour < 10) {
          t = "0" + hour + ":";
        } else {
          t = hour + ":";
        }

        if (min < 10) {
          t += "0";
        }
        t += min + ":";
        if (sec < 10) {
          t += "0";
        }
        t += sec;
      }

      return t === '24:00:00' ? '23:59:59' : t;
    },
    // 时间转成秒数 time是number类型毫秒值1679968027000
    timeToSec(time) {
      let date = new Date(time)
      let hour = date.getHours()
      let min = date.getMinutes()
      let sec = date.getSeconds()
      return hour * 3600 + min * 60 + sec;
    },
    // 定位时间，父页面使用
    positionTime(time) {
      let second = this.timeToSec(time);
      let left = second / (24 * 3600 + this.intervalArr[this.intervalNum]) * this.$refs["timeline-main"].offsetWidth;
      let boxLeft = this.parentWidth / 2 - Math.ceil(left)
      let mainBox = $("#timeline-main-" + this.guid)[0];
      mainBox.style.left = boxLeft + "px";
    },
    // 设置录像背景
    setBackground(records) {
      this.recordRange = []
      if (records && records.length > 0) {
        // let dayStart = this.lastBgSetDate + " 00:00:00"
        // let dayEnd = this.lastBgSetDate + " 23:59:59"
        records.forEach(item => {
          // if (item.beginTime <= dayEnd) {
            // item.beginTime = item.beginTime >= dayStart ? item.beginTime : dayStart
            // item.endTime = item.endTime <= dayEnd ? item.endTime : dayEnd
            // let location = this.getLocationByTimeRange(item.beginTime, item.endTime)
            let location = this.getLocationByTimeRange(item.beginTime, item.endTime)
            this.recordRange.push(location)
          // }
        })
      }
    },
    // 更新录像背景
    updateBackground() {
      if (this.recordRange && this.recordRange.length > 0) {
        let records = JSON.parse(JSON.stringify(this.recordRange))
        this.recordRange = []
        for (let index = 0; index < records.length; index++) {
          let element = this.getLocationByTimeRange(records[index].beginTime, records[index].endTime)
          this.recordRange.push(element)
        }
      }
    },

    // 通过时间段获取位置
    getLocationByTimeRange(beginTime, endTime) {
      let result = {beginTime: beginTime, endTime: endTime}
      let startSecond = this.timeToSec(beginTime);
      let left = startSecond / (24 * 3600 + this.intervalArr[this.intervalNum]) * this.$refs["timeline-main"].offsetWidth;
      result.left = left.toFixed(2)

      let endSecond = this.timeToSec(endTime);
      // 加0.1是为了防止四舍五入可能引出出现间隙的情况
      let width = (endSecond - startSecond) / (24 * 3600 + this.intervalArr[this.intervalNum]) * this.$refs["timeline-main"].offsetWidth + 0.1;
      result.width = width.toFixed(2)
      return result
    },
    // 刷新时间点
    refresh() {
      // 初始化时间定为当前的时分
      let now = 0;
      this.timeArr = [];
      //最大时间点24点对应的秒数，也就是86400s
      let max = 86400;
      while (now < max) {
        this.timeArr.push(this.secToTime(now));
        now += this.intervalArr[this.intervalNum];
      }
      this.timeArr.push("23:59:59");
      let offsetLeft = this.$refs["timeline-main"].offsetLeft;
      this.$nextTick(() => {
        let allTimelines = document.querySelectorAll(
          ".timeline-text-" + this.guid
        );
        let offsetWidth = allTimelines[0].offsetWidth;
        let num = Math.floor((this.parentWidth / 2 - offsetLeft) / offsetWidth)
        let intervalWidth = this.parentWidth / 2 - offsetLeft - (offsetWidth * num)
        let nowSecond = this.intervalArr[this.intervalNum] * (num + intervalWidth / offsetWidth) 
        this.selectTime = this.secToTime(nowSecond)

        // 更新录像背景
        this.updateBackground()
      });
    },
    // 放大
    turnUp() {
      if (this.intervalNum <= 0) {
        return;
      }
      if (this.paddingRight >= this.maxRight) {
        this.paddingRight = this.minRight;
        this.intervalNum -= 1;
      } else {
        this.paddingRight += 3;
      }

      // 刷新时间轴
      this.refresh();
    },
    // 缩小
    turnDown() {
      if (this.intervalNum >= this.intervalArr.length - 1) {
        return;
      }
      if (this.paddingRight <= this.minRight) {
        this.paddingRight = this.maxRight;
        this.intervalNum += 1;
      } else {
        this.paddingRight -= 3;
      }

      // 刷新时间轴
      this.refresh();
    },

    // 节流函数
    throttle(fn, delay) {
      let timer = null;
      return function () {
        if (timer) {
          return;
        }
        timer = setTimeout(() => {
          fn.apply(this, arguments);
          timer = null;
        }, delay);
      };
    },

    // 防抖函数
    debounce(fn, time, timer) {
      timer = timer || null;
      return function () {
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.call(this, args);
        }, time);
      };
    },
    /**
     * add Zero 月日时分秒补0函数
     */
    addZero: (time) => {
        let newTime = time > 9 ? time : '0' + time
        return newTime
    },
  },
  mounted() {
    this.parentWidth = this.$refs["timeline-" + this.guid].offsetWidth;
    this.paddingRight = this.maxRight

    var box = $("#timeline-main-" + this.guid);

    // 初始化默认是12点
    this.$nextTick(() => {
      let now = new Date()
      let defaultTime = `${now.getFullYear()}-${this.addZero(now.getMonth() + 1)}-${this.addZero(now.getDate())} 12:00:00`
      this.positionTime(new Date(defaultTime).getTime())
    });

    // 刷新时间轴
    this.refresh();

    // 时间点右边距增加减少事件
    const upEvent = this.throttle(this.turnUp, 10);
    const downEvent = this.throttle(this.turnDown, 10);

    const that = this;
    // 鼠标滑轮事件
    var scrollFunc = function (e) {
      e = e || window.event;
      // 阻止冒泡和默认行为
      e.stopPropagation();
      e.preventDefault(); 
      if (e.wheelDelta) {
        //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) {
          //当滑轮向上滚动时
          upEvent();
        }
        if (e.wheelDelta < 0) {
          //当滑轮向下滚动时
          downEvent();
        }
      } else if (e.detail) {
        //Firefox滑轮事件
        if (e.detail > 0) {
          //当滑轮向上滚动时
          upEvent();
        }
        if (e.detail < 0) {
          //当滑轮向下滚动时
          downEvent();
        }
      }
      return false;
    };
    //给页面绑定滑轮滚动事件
    if (document.addEventListener) {
      this.$refs["timeline-main"].addEventListener("DOMMouseScroll", scrollFunc, false);
    }
    //滚动滑轮触发scrollFunc方法
    document.querySelector("#timeline-main-" + this.guid).onmousewheel = scrollFunc;

    
    var body = $("body");
    var index = 0;
    var x1;
    // 按下鼠标左键
    box.mousedown(function () {
      index = 1; //鼠标按下才能触发onmousemove方法
      var x = event.clientX; //鼠标点击的坐标值，x
      var left = this.style.left;
      left = left.substr(0, left.length - 2); //去掉px
      x1 = parseInt(x - left);
    });
    // 鼠标指针在时间轴中移动
    box.mousemove(function () {
      if (index === 1) {
        let allTimelines = document.querySelectorAll(".timeline-text-" + that.guid);
        let offsetWidth = allTimelines[0].offsetWidth;

        let left = event.clientX - x1;
        if (left > that.parentWidth / 2) {
          return;
        }
        if (left < 0 && -left + that.parentWidth / 2 > offsetWidth * (allTimelines.length - 1)) {
          return;
        }
        this.style.left = left + "px";

        let num = Math.floor((that.parentWidth / 2 - left) / offsetWidth)
        let intervalWidth = that.parentWidth / 2 - left - (offsetWidth * num)
        let nowSecond = that.intervalArr[that.intervalNum] * (num + intervalWidth / offsetWidth) 
        that.selectTime = that.secToTime(nowSecond)
      }
    });
    // 松开鼠标左键
    box.mouseup(function () {
      index = 0;
    });
    body.mouseup(function () {
      index = 0;
    });

    this.timerChange = this.debounce(() => {
      this.$emit("timer-change", this.selectTime);
    }, 1000)

    window.addEventListener("resize", that.resizeFn = that.debounce(() => {
        that.parentWidth = that.$refs["timeline-" + that.guid].offsetWidth;
      }, 50)
    )
  },
  created() {
    this.guid = Math.ceil((1 + Math.random()) * 100000000);
  },
  deactivated() {
    window.removeEventListener("resize", this.resizeFn);
  },
};
</script>
 
<style>
.record-bg-span {
    z-index: -1;
    background: #EEBBB8;
    position: absolute;
    height: 100%;
}
.record-bg-div {
  width: 100%;
  position: absolute;
  height: 100%;
  top: 0;
}
.timeline {
  height: 26px;
  overflow-x: hidden;
  background: #eee;
  position: relative;
  width: calc(100% - 120px);
  margin-left: 120px;
}

.timeline-line {
  position: absolute;
    border-right: 1px solid red;
    left: 50%;
    height: 26px;
    margin: 0;
    z-index: 1;
}

.timeline-main {
  -moz-user-select: none;
  -khtml-user-select: none;
  user-select: none;
  position: absolute;
  left: 0;
  top: 4px;
  cursor: pointer;
  opacity: 0.9;
}
</style>