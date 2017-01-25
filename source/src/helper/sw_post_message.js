const m_util = require('common/util');

let index = 0;
let postMessage = function(){};
let callbackDict = {};

if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', function(event) {
    let {cbid, resp} = event.data;
    if(cbid && callbackDict[cbid]){
      callbackDict[cbid](resp);
      delete callbackDict[cbid];
    }
  }); //页面通过监听service worker的message事件接收service worker的信息
  postMessage = function(req, callback){
    if(navigator.serviceWorker.controller && navigator.serviceWorker.controller.state=='activated'){
      index++;
      let obj = {req};
      if(callback){
        obj.cbid = m_util.getRandomName() + index;
        callbackDict[obj.cbid] = callback;
      }
      navigator.serviceWorker.controller.postMessage(obj);  //页面向service worker发送信息
    }
  }
}


module.exports = postMessage;//postMessage(message, callback)
