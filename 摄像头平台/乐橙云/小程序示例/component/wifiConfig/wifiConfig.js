module.exports=function(e){var t={};function i(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=6)}({6:function(e,t,i){"use strict";Component({properties:{SN:{type:String,value:""},wifiName:{type:String,value:""},wifiPassword:{type:String,value:""},SC:{type:String,value:""}},data:{showConnect:!1},lifetimes:{ready:function(){this.startSearch(),wx.showLoading({title:"连接中"})},detached:function(){console.log("子组件销毁===detached"),this.setTimeoutTimer&&clearTimeout(this.setTimeoutTimer),this.connectWifiTimer&&clearTimeout(this.connectWifiTimer),this.stopSearch(),wx.hideLoading(),wx.disableAlertBeforeUnload()}},methods:{startSearch:function(){var e=this;wx.startWifi({success:function(t){wx.connectWifi({SSID:"DAP-"+e.data.SN,password:"undefined"===e.data.SC?"":e.data.SC,success:function(t){console.log("connectWif success",t),setTimeout((function(){e.connectWifiTimer=e.onConnectedWifi()}),2e3)},fail:function(t){console.log("connectWif fail",t),e.redirectFlag=!0,e.handleSet()}})},fail:function(e){console.log("startWifi fail",e)}})},handleSet:function(){this.setData({showConnect:!0}),this.connectWifiTimer&&clearTimeout(this.connectWifiTimer),this.stopSearch(),wx.hideLoading()},onConnectedWifi:function(){var e=this;wx.getConnectedWifi({success:function(t){console.log("success",t,e.data),t.wifi.SSID==="DAP-"+e.data.SN?setTimeout((function(){wx.request({url:"http://192.168.111.1:13015/v1/wireless/wifi/set",method:"POST",data:{SSID:e.data.wifiName,encryption:7,password:e.data.wifiPassword},complete:function(t){e.stopSearch(),e.redirectFlag=!0,e.triggerEvent("onSuccess")}})}),2e3):(e.redirectFlag=!0,e.handleSet())},fail:function(t){e.redirectFlag=!0,e.handleSet()}})},stopSearch:function(){wx.stopWifi({success:function(e){console.log(e)},fail:function(e){console.log(e)}})},sendData:function(){var e=this;wx.getConnectedWifi({success:function(t){console.log("getConnectedWifi",t),t.wifi.SSID==="DAP-"+e.data.SN?wx.request({url:"http://192.168.111.1:13015/v1/wireless/wifi/set",method:"POST",data:{SSID:e.data.wifiName,encryption:7,password:e.data.wifiPassword},complete:function(t){e.stopSearch(),e.redirectFlag=!0,e.triggerEvent("onSuccess")}}):(e.stopSearch(),e.redirectFlag=!0,e.triggerEvent("onFail"))}})},handleSearch:function(){var e=this;wx.startWifi({success:function(t){wx.connectWifi({SSID:"DAP-"+e.data.SN,password:e.data.SC,maunal:!0,complete:function(t){e.startWifi=!0}})}})}},pageLifetimes:{show:function(){var e=this;this.startWifi&&(this.startWifi=!1,wx.showLoading({title:"连接中"}),console.log("sendData========= onshow"),this.setTimeoutTimer=setTimeout((function(){e.sendData()}),3e3))},ready:function(){this.startWifi&&wx.enableAlertBeforeUnload({message:"设备添加尚未完成。如果退出，您将需要重新开始添加流程。是否退出？",success:function(e){console.log("success:",e)},fail:function(e){console.log("fail:",e)},complete:function(e){console.log("complete:",e)}})}}})}});