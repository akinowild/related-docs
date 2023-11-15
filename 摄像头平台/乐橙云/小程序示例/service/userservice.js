import {
  request,
  requestnoload
} from './network.js'

const md5 = require('../utils/md5')
const util = require('../utils/util')
/**
 *
 * @param {string} appId  用户appId
 * @param {string} appSecret  用户appSecret
 * @description 调用http接口生成accessToken
 */
export function getAccessToken(appId, appSecret){
  return request({
     msg: "账户登录中ing",
     url: 'accessToken',
     data:{
       appId,
       appSecret
     }
   })
}

