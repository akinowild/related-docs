/**
 * 提示弹框
 * @params {String} content: 提示内容
 * @params {Object} options: 配置属性
 */
const showModal = (content, options) => {
  wx.showModal({
    content,
    showCancel: false,
    confirmText: '知道了',
    ...options
  });
};

/**
 * 获取元素样式(在页面中使用)
 * @params {String} dom: 设置的class或id
 */
const getDomStyle = (dom) => {
  const domClass = dom + '';
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select(domClass).boundingClientRect(res => {
      res ? resolve(res) : reject(res);
    }).exec();
  });
};




/**
 *
 * @param {number} number 生成随机数的个数
 */
function makeRandom(number){
  const chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	let nums="";
	for(var i=0;i<number;i++){
    var id = parseInt(Math.random()*61);
    nums+=chars[id];
  }
	return nums;
}







// 时间戳 返回 UTC yymmss
const  getHourMiSe = (time) =>{
  // console.log(time)
  const data  = new Date(time)
  // console.log('data',data)
  const h = data.getUTCHours()
  const m =  data.getUTCMinutes()
  const s = data.getUTCSeconds()
  return `${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`
};

/**
 * 获取今天的后一天
 */
const getNextDate = function(date, day) {
  var dd = new Date(date);
  dd.setDate(dd.getDate() + day);
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  return y + "-" + m + "-" + d;
};
module.exports = {
  showModal,
  getDomStyle,
  makeRandom,
  getHourMiSe,
  getNextDate
}
