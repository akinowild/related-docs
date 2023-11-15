// component/switch/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    checkItem: 1,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindtouchend(){
      this.triggerEvent("checkChange", !this.data.checkItem)
      this.setData({checkItem: !this.data.checkItem})
    }
  }
})
