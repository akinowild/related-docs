import {
  BASE_URL,
  TIMEOUT
} from '../utils/config.js'

const md5 = require('../utils/md5')
const util = require('../utils/util')
/**
 *
 * @param {object} options
 * @description 使用 promise 封装 wx.request
 */
export function request(options) {
  console.log(options)
  wx.showLoading({
    title: options.msg,
  })
  const { appId, appSecret, params } = options.data
  const time = parseInt(Date.now()/1000)
  const nonce = util.makeRandom(32)
  const sign = `time:${time},nonce:${nonce},appSecret:${appSecret}`
  const signMd5 = md5.hexMD5(sign)
  return new Promise((resolve, reject) => {

    wx.request({
      url: BASE_URL + options.url,
      method: 'post',
      timeout: TIMEOUT,
      data: {
        system: {
          "ver":"1.0",
          appId,
          sign: signMd5,
          nonce,
          time,
        },
        id: nonce,
        params,
      },
      success: function(res) {
        console.log(res)
        resolve(res.data)
      },
      fail: reject,
      complete: res => {
        wx.hideLoading()
      }
    })
  })
}


/**
 * 纯  request， 便于终止请求
 */

 export function primaryRequest(options){
  const { appId, appSecret, params } = options.data
    const time = parseInt(Date.now()/1000)
    const nonce = util.makeRandom(32)
    console.log('url',options.url, 'params', params)
    const sign = `time:${time},nonce:${nonce},appSecret:${appSecret}`
    const signMd5 = md5.hexMD5(sign)
    return wx.request({
      url: BASE_URL + options.url,
      method: 'post',
      timeout: TIMEOUT,
      data: {
        system: {
          "ver":"1.0",
          appId,
          sign: signMd5,
          nonce,
          time,
        },
        id: nonce,
        params,
      },
      success: function(res) {
        options.success && options.success(res)
      },
      fail: function(res){
        options.fail && options.fail(res)
      },
    })

 }

