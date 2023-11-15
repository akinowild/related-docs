  import {
  request,
} from './network.js'



export function getKitToken(accessToken, deviceId, channelId,appId,appSecret) {
  return request({
    msg: "数据加载中ing",
    url: 'getKitToken',
    data: {
      appId,
      appSecret,
      params: {
        type: '0',
        deviceId,
        channelId,
        token: accessToken
      }
    }
  })
}




/**
 * 加载设备列表
 * @param {*} token
 * @param {*} page
 * @param {*} msg
 */
export function videoList(accessToken, page, msg, appId, appSecret) {
  return request({
    msg: msg,
    url: 'listDeviceDetailsByPage',
    data: {
      appId,
      appSecret,
      params: {
        token: accessToken,
        pageSize: 10,
        page,
      }
    }
  })
}

/**
 * 搜索设备列表
 * @param {*} token
 * @param {*} deviceId
 * @param {*} msg
 */
export function searchVideoList(accessToken, deviceId, msg, appId, appSecret) {
  return request({
    msg: msg,
    url: 'listDeviceDetailsByIds',
    data: {
      appId,
      appSecret,
      params:{
        token: accessToken,
        deviceList: [{deviceId}]
      }
    },
  })
}

