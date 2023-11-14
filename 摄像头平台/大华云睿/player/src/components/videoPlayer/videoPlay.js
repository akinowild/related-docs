import { checkBrowser } from './playerWasm/public.js'

const libHasLoad = (src) => {
  const scripts = document.getElementsByTagName("script")
  for (let index = 0; index < scripts.length; index++) {
    if (scripts[index].src.includes(src)) {
      return true
    }
  }
  return false
}

const loadScript = (src) => {
  if (libHasLoad(src)) {
    // this.$message.warning("播放库js已加载")
    return;
  }
  const dom = document.createElement('script')
  dom.src = src
  document.head.appendChild(dom)
}

const loadLibDHPlay = (bSupportMultiThread) => {
  let libPath = 'WasmLib/MultiThread/libplay.js'
  if (typeof SharedArrayBuffer == 'undefined' || !bSupportMultiThread) {
    libPath = 'WasmLib/SingleThread/libplay.js'
  }
  loadScript(libPath)
}

const init = (players) => {
  if (!players) return
  let cPlusVisibleDecCallBack = () => {}
  let cDigitalSignCallBack = () => {}
  let cExtraDrawDataCallBack = () => {}
  let cExtraDrawDrawCallBack = () => {}
  let cRecordDataCallBack = () => {}
  if (players.length) {
    cPlusVisibleDecCallBack = (nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo) => {
      players.forEach((player) => {
        // 多窗口需要执行多个窗口对象的对应方法
        player && player.cPlusVisibleDecCallBack(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo)
      })
    }
    cDigitalSignCallBack = (nPort, nFrameID, bSuccess) => {
      players.forEach((player) => {
        // 多窗口需要执行多个窗口对象的对应方法
        player && player.cDigitalSignCallBack(nPort, nFrameID, bSuccess)
      })
    }
    cExtraDrawDataCallBack = (nPort, nDataType, pDrawData, nDataLen) => {
      players.forEach((player) => {
        // 多窗口需要执行多个窗口对象的对应方法
        player && player.cExtraDrawDataCallBack(nPort, nDataType, pDrawData, nDataLen)
      })
    }
    cExtraDrawDrawCallBack = (nPort) => {
      players.forEach((player) => {
        // 多窗口需要执行多个窗口对象的对应方法
        player && player.cExtraDrawDrawCallBack(nPort)
      })
    }
    cRecordDataCallBack = (nPort, pData, nDataLen, nOffset, pRecordFrameInfo) => {
      players.forEach((player) => {
        // 多窗口需要执行多个窗口对象的对应方法
        player && player.cRecordDataCallBack(nPort, pData, nDataLen, nOffset, pRecordFrameInfo)
      })
    }
  }
  window.cPlusVisibleDecCallBack = cPlusVisibleDecCallBack

  window.cDigitalSignCallBack = cDigitalSignCallBack

  window.cExtraDrawDataCallBack = cExtraDrawDataCallBack

  window.cExtraDrawDrawCallBack = cExtraDrawDrawCallBack

  window.cRecordDataCallBack = cRecordDataCallBack

  const { bSupportMultiThread } = checkBrowser()
  loadLibDHPlay(bSupportMultiThread)
}

export default { init }
