# blueToothConfig

> 乐橙开发平台设备蓝牙配网组件

---

## 引用

- 下载 npm 包放到自有小程序 components 文件夹下
- 组件引入 [官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)

  ```html
  <blue-tooth-config
    SN="{{SN}}"
    SC="{{SC}}"
    PID="{{PID}}"
    wifiName="{{wifiName}}"
    wifiPassword="{{wifiPassword}}"
    bindonFail="onFail"
    bindonSuccess="onSuccess"
  />
  ```

- 安装依赖 crypto-js [官方文档 - npm 支持](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)
  > 如当前小程序已安装依赖，可忽略此步骤

## API 说明

| 参数         | 描述           | 类型     | 必填 |
| ------------ | -------------- | -------- | :--: |
| SN           | 设备序列号     | String   |  √   |
| wifiName     | -              | String   |  √   |
| wifiPassword | -              | String   |  √   |
| PID          | 设备 productId | String   |  √   |
| SC           | 设备密码       | String   |  √   |
| onSuccess    | 软 AP 配网成功 | Function |  √   |
| onFail       | 软 AP 配网失败 | Function |  √   |
