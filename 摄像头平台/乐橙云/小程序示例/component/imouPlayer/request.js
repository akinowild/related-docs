import { BASE_URL } from '../../utils/config'
const md5 = require('./md5');

export default function request(options) {
  const { appId, appSecret, params } = options.data;
  const time = parseInt(Date.now() / 1000);
  const nonce = makeRandom(32);
  const sign = `time:${time},nonce:${nonce},appSecret:${appSecret}`;
  const signMd5 = md5.hexMD5(sign);
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: 'POST',
      timeout: 30000,
      data: {
        system: {
          ver: '1.0',
          appId,
          sign: signMd5,
          nonce,
          time,
        },
        id: nonce,
        params,
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: reject,
    });
  });
}

/**
 *
 * @param {number} number 生成随机数的个数
 */
function makeRandom(number) {
  const chars = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  let nums = '';
  for (var i = 0; i < number; i++) {
    var id = parseInt(Math.random() * 61);
    nums += chars[id];
  }
  return nums;
}
