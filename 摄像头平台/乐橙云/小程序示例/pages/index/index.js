//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    navigator: [
      {
        title: '自助设备',
        url: '/pages/selfDevice/index/index',
        // url: '/pages/selfDevice/openvideoplay/openvideoplay',
        png: '/image/index/selfDevice.png',
      },
      {
        title: '设备配网',
        url: '/pages/configTool/index/index',
        png: 'https://festatic.imou.com/webfrontstatic/694da0fd6e3949c2a781ac7d453722fa_20230609/icon_shebeipeiwang.png',
      },
    ],
    containerStyle: '',
    src: '',
    pushUrl: '',
  },

  onReady() {
    app.$getDomStyle('.container').then((res) => {
      // 页面当前高度
      const pageHeight = res && res.height;
      app.$getDomStyle('.footer').then((opt) => {
        // footer在当前设备高度
        const footerHeight = opt && opt.height;
        app.$getDomStyle('.list').then((data) => {
          const bottom = data && data.bottom;
          const minHeight = pageHeight - bottom;
          if (minHeight <= footerHeight) {
            this.setData({
              containerStyle: footerHeight - minHeight + 'px',
            });
          }
        });
      });
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '乐橙开放平台',
      path: '/pages/index/index',
    };
  },
});
