## README

因为存在有依赖 vant 三方UI库，所以需要进行 npm 包的构建，具体方案， 见[官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)



此录像回放拖拽的实现方案为：

1. 加载 录像片段
2. 监听用户移动
3. 根据用户动作，判断起始时间，获取新播放地址填入 live-player



因 使用 live-player，故开发者需判断小程序主体是否存在该资质，如若不可行，可参见上诉实现方案，使用hls链接的方式进行替换。