const instance = axios.create({
    timeout: 10000
})

/**
 * @method resetAjax ()ajax方法的封装
 * @param param.method 请求的方法
 * @param param.url 请求的地址
 * @param param.data 请求的数据
 * @param param.needRequestData 接口返回时需要同时返回请求的数据
 * @param param.onSuccess 成功时需要的回调
 * @param param.onError 错误时需要的回调
 */
export default (param) => {
    instance({
        method: param.method,
        url: param.url,
        data: param.data || {},
        headers: param.headers || {}
    }).then((res) => {
        param.needRequestData && res.data && (res.data.requestData = JSON.parse(res.config.data))
        if (res.status === 200) {
            param.onSuccess && param.onSuccess(res.data)
        } else {
            param.onError && param.onError(res.data)
        }
    }).catch((e) => {
        param.onError && param.onError(e)
    })
}