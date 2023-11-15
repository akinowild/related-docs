# wifiConfig

> 乐橙开发平台设备软 AP 配网组件

---

## 引用

- 下载 npm 包放到自有小程序 components 文件夹下
- 组件引入 [官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)

```html
<wifi-config
  SN="{{SN}}"
  SC="{{SC}}"
  wifiName="{{wifiName}}"
  wifiPassword="{{wifiPassword}}"
  bindonFail="onFail"
  bindonSuccess="onSuccess"
/>
```

## API 说明

| 参数         | 描述           | 类型     | 必填 |
| ------------ | -------------- | -------- | :--: |
| SN           | 设备序列号     | String   |  √   |
| wifiName     | -              | String   |  √   |
| wifiPassword | -              | String   |  √   |
| SC           | 设备密码       | String   |  √   |
| onSuccess    | 软 AP 配网成功 | Function |  √   |
| onFail       | 软 AP 配网失败 | Function |  √   |
