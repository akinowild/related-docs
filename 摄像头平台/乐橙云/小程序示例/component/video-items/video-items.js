// components/video-items.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    videolist: {
      type: Array,
      value: []
    },
    baseUrl: {
      type: String,
      value: '/pages/selfDevice/openvideoplay/openvideoplay'
    },
    height: {
      type: Number,
      value: 500
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },
  lifetimes:{
    created() {
      console.log(this.data.videolist,'this.videolist created')
    },
  },
  options: {
    addGlobalClass: true
  },

})