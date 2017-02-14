var version = 'v21';
var namePrefix = 'swblog-';
var nameReg = new RegExp('^' + namePrefix);
var businessKey = 'business-' + version;
var businessCacheName = namePrefix + businessKey;
var libCacheName = namePrefix + 'lib-' + version;
var imageCacheName = namePrefix + 'image';
var markdownCacheName = namePrefix + 'markdown';

var expectedCaches = [
  businessCacheName, //业务代码  对于开发者常变，先用缓存，同时更新，下次进来再用新的(更新不需要改version)。
  libCacheName, //各种引用库的资源 不常变，可以通过更改version实现更新。
  markdownCacheName, //文章资源 根据规则变
  imageCacheName  //图片资源，由于没办法完全从链接判断是否为图片，回包后再判断是否为图片，然后缓存
];
//正则匹配缓存文件
var regDict = {};

regDict[markdownCacheName] = /\.md$|\.md\?[^?]+$/;
regDict[libCacheName] = /\.js$|\.css$|\.html$|\.woff|\.woff2$/;
//安装文件
var FILES = [
  '/',
  '/index.html',
  '/source/lib/bootstrap-custom/css/custom.bootstrap.css',
  '/source/lib/blog.css',
  '/source/lib/bcd.min.js',
  '/source/dist/index.js'
];


self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Installed version', version);
  event.waitUntil(caches.open(businessCacheName).then(function (cache) {
    return cache.addAll(FILES);
  }).then(function () {
    console.log('[ServiceWorker] Skip waiting on install');
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (event) {

  self.clients.matchAll({
    includeUncontrolled: true
  }).then(function (clientList) {
    var urls = clientList.map(function (client) {
      return client.url;
    });
    //如果新sw生效，对其他页面造成影响，这里可以查
    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
  });

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          // 删除掉当前定义前缀中不在expectedCaches中的缓存集
          if (nameReg.test(cacheName) && expectedCaches.indexOf(cacheName) == -1) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      //使service worker立马生效，在单页面应用中，这样是合理的
      console.log('[ServiceWorker] Claiming clients for version', version);
      return self.clients.claim();
    }));
});

var getNoSearch = function(url){
  return url.replace(/\?[^?]+/,'');
}

//更新缓存
var addToCache = function (dbName, req, response) {

  return fetch(req.clone()).then(function (resp) {
    if (resp.type !== 'basic' && resp.type !== 'cors') {
      return resp;
    }
    if (resp.status !== 200) {
      throw new Error('response status is ' + resp.status);
    }
    var cacheResp = resp.clone();
    if(dbName===imageCacheName && !/^image\//.test(resp.headers.get('content-type'))){
      return resp;
    }
    caches.open(dbName).then(function (cache) {
      //删除旧文件
      let urlKey = getNoSearch(req.url);
      cache.keys().then(function (oldReqList) {
        oldReqList.filter(oldReq => oldReq.url.indexOf(urlKey) > -1).forEach(function (oldReq) {
          cache.delete(oldReq);
        });
        //添加新文件
        cache.put(req.clone(), cacheResp);
      });
    });

    return resp;
  }).catch(function (error) {
    if (response) { //请求失败用缓存保底
      console.log(`[ServiceWorker] fetch failed (${ req.url }) and use cache`, error);
      return response;
    } else {
      return caches.open(dbName).then(function(cache) {
        //取旧缓存
        let urlKey = getNoSearch(req.url);
        return cache.keys().then(function(oldReqList){
          let oldReq;
          while(oldReq=oldReqList.pop()){
            if(oldReq.url.indexOf(urlKey) > -1){
              return cache.match(oldReq)
            }
          }
          return null;
        });
      }).then(function(resp){
        if(resp){
          console.log(`[ServiceWorker] fetch failed (${ req.url }) and use old cache`, error);
          return resp;
        }
        // Respond with a 400 "Bad Request" status.
        console.log(`[ServiceWorker] fetch failed: ${ req.url }`, error);
        return new Response(new Blob, {
          'status': 400,
          'statusText': 'Bad Request'
        });
      });
    }
  });
};


var fetchCache = function (dbName, req) {
  return caches.open(dbName).then(function (cache) {
    return cache.match(req.clone());
  }).then(function (response) {
    if (response) {
      if (dbName == businessCacheName) {
        addToCache(dbName, req, response);
      }
      return response; //如果命中缓存，直接使用缓存
    } else {
      return addToCache(dbName, req);
    }
  });
}
self.addEventListener('fetch', function (event) {

  var req, url = event.request.url;
  var requestURL = new URL(url);

  // if (url.indexOf('http:') === 0) {
  //   return event.respondWith(fetch(event.request.clone()));
  // }

  if (requestURL.search.indexOf('cors=1') !== -1) {
    req = new Request(url, {
      mode: 'cors'
    });
  } else {
    req = event.request.clone();
  }

  if (FILES.indexOf(requestURL.pathname) > -1) {
    return event.respondWith(fetchCache(businessCacheName, req));
  }

  for (var dbName in regDict) {
    if (regDict[dbName].test(url)) {
      return event.respondWith(fetchCache(dbName, req));
    }
  }

  if(requestURL.protocol!='https:' || /\.json$/.test(url)){
    return;
  }

  return event.respondWith(fetchCache(imageCacheName, req));

});


function iterator(originList, callback) {
  if (originList && originList.length) {
    var list = originList.slice();
    var item = list.shift();
    var next = function () {
      iterator(list, callback);
    };
    callback(item, next, list);
  }
}
//dict格式：{url: resp.text()}
var getTexts = function(dict){
  var pList = [];
  var urlList = [];
  for (var key in dict) {
    pList.push(dict[key]);
    urlList.push(key);
  }
  return Promise.all(pList).then(function (tList) {
    var rDict = {};
    tList.forEach(function (t, i) {
      rDict[urlList[i]] = t;
    });
    return rDict;
  })
}

//静态资源预加载（不支持返回内容与search参数相关的接口预加载）
var preloadList = function (urlList) {
  let retDict = {};
  return new Promise(function (resolve) {
    iterator(urlList, function (url, next, list) {
      let myRequest = new Request(url);
      for (var dbName in regDict) {
        if (regDict[dbName].test(url)) {
          caches.open(dbName).then(function (cache) {
            return cache.match(myRequest.clone());
          }).then(function (response) {
            if (response) {
              return response;
            } else {
              return addToCache(dbName, myRequest);
            }
          }).then(function (resp) {
            if (resp.status == 200) {
              retDict[url] = resp.text();
            }
            if (list.length) {
              setTimeout(next, 10);
            } else {
              getTexts(retDict).then(resolve);
            }
          });
          break;
        }
      }
    });
  });
};

var preloadAtricle = function(urlList, callback){
  var urlDict = {};
  var noSearchDict = {};
  var needReloadList = [];
  var retDict = {};
  urlList.forEach(function(o){
    var url = new Request(o).url;
    noSearchDict[getNoSearch(url)] = 1;
    urlDict[url] = 1;
  });

  return caches.open(markdownCacheName).then(function(cache) {
    //取旧缓存
    // let urlKey = req.url.replace(/\?[^?]+/,'');
    // if(oldReq.url.indexOf(urlKey) > -1){
    //   return cache.match(oldReq)
    // }
    return cache.keys().then(function(reqList){
      var oldReq;
      while(oldReq=reqList.pop()){
        let noSearchURL = getNoSearch(oldReq.url);
        if(urlDict[oldReq.url]){
          delete noSearchDict[noSearchURL];
          retDict[oldReq.url] = cache.match(oldReq).then(function(resq){
            return resq.text();
          });
          delete urlDict[oldReq.url];
        }else if(noSearchDict[getNoSearch(oldReq.url)]){
          retDict[oldReq.url] = cache.match(oldReq).then(function(resq){
            return resq.text();
          });
        }
      }
      for(var url in urlDict){
        needReloadList.push(url);
      }
      preloadList(needReloadList).then(callback).then(sendMessage);
      return getTexts(retDict);
    });
 });
};

//sw与页面通信
function _processMessage(data, senderID) {
  data = data || {};
  var cbid = data.cbid;
  var msgObj = data.req;
  var resolveFun = function(result){
    return {
      senderID: senderID,
      cbid: cbid,
      resp: result
    }
  };
  switch (msgObj.m) {
  case 'preload':
    return preloadList(msgObj.list).then(resolveFun);
  case 'preloadAtricle':
    return preloadAtricle(msgObj.list, resolveFun).then(resolveFun);
  case 'delete_not_exist_article':
    let articleDict = msgObj.dict;
    if (!articleDict) {
      return new Promise(function () {});
    }
    return caches.open(markdownCacheName).then(function (cache) {
      //删除不存在的博客文件
      cache.keys().then(function (oldReqList) {
        oldReqList.forEach(oldReq => {
          let urlKey = decodeURI(oldReq.url.replace(/\?[^?]+/, ''));
          if (!articleDict[urlKey]) {
            cache.delete(oldReq);
          }
        });
      });
    });
  default:
    return new Promise(function (resolve) {
      resolve(console.log('msgObj.m=' + msgObj.m + ' match nothing!'));
    });
  }
}

function sendMessage(resp){
  if(!resp || !('cbid' in resp)){
    return;
  }
  return self.clients.matchAll()
    .then(function (clientList) {
      if (resp.senderID === null) {
        console.log('event.source is null; we don\'t know the sender of the ' +
          'message');
        clientList.forEach(function (client) {
          client.postMessage(resp);
        });
      } else {
        clientList.some(function (client) {
          // Skip sending the message to the client that sent it.
          if (client.id === resp.senderID) {
            client.postMessage(resp);
            return true;
          }
        });
      }
    });
}

// Listen for messages from clients.
self.addEventListener('message', function (event) {
  // Get all the connected clients and forward the message along.
  var senderID = event.source ? event.source.id : null; //在低版本中可能没有“source”属性
  var promise = _processMessage(event.data, senderID).then(sendMessage);
  // If event.waitUntil is defined (not yet in Chrome because of the same issue detailed before),
  // use it to extend the lifetime of the Service Worker.
  if (event.waitUntil) {
    event.waitUntil(promise);
  }
});


// Start polyfill hack
(function () {
  var nativeAddAll = Cache.prototype.addAll;
  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);

  // Has nice behavior of `var` which everyone hates
  if (userAgent) {
    var agent = userAgent[1];
    var version = parseInt(userAgent[2]);
  }


  //https://github.com/jakearchibald/offline-news-service-worker 未知使用情景
  if (!CacheStorage.prototype.match) {
    // This is probably vulnerable to race conditions (removing caches etc)
    CacheStorage.prototype.match = function match(request, opts) {
      var caches = this;

      return this.keys().then(function (cacheNames) {
        var match;

        return cacheNames.reduce(function (chain, cacheName) {
          return chain.then(function () {
            return match || caches.open(cacheName).then(function (cache) {
              return cache.match(request, opts);
            }).then(function (response) {
              match = response;
              return match;
            });
          });
        }, Promise.resolve());
      });
    };
  }
  // End polyfill hack

  if (
    nativeAddAll && (!userAgent ||
      (agent === 'Firefox' && version >= 46) ||
      (agent === 'Chrome' && version >= 50)
    )
  ) {
    return;
  }

  Cache.prototype.addAll = function addAll(requests) {
    var cache = this;

    // Since DOMExceptions are not constructable:
    function NetworkError(message) {
      this.name = 'NetworkError';
      this.code = 19;
      this.message = message;
    }

    NetworkError.prototype = Object.create(Error.prototype);

    return Promise.resolve().then(function () {
      if (arguments.length < 1) throw new TypeError();

      // Simulate sequence<(Request or USVString)> binding:
      var sequence = [];

      requests = requests.map(function (request) {
        if (request instanceof Request) {
          return request;
        } else {
          return String(request); // may throw TypeError
        }
      });

      return Promise.all(
        requests.map(function (request) {
          if (typeof request === 'string') {
            request = new Request(request);
          }

          var scheme = new URL(request.url).protocol;

          if (scheme !== 'http:' && scheme !== 'https:') {
            throw new NetworkError("Invalid scheme");
          }

          return fetch(request.clone());
        })
      );
    }).then(function (responses) {
      // If some of the responses has not OK-eish status,
      // then whole operation should reject
      if (responses.some(function (response) {
          return !response.ok;
        })) {
        throw new NetworkError('Incorrect response status');
      }

      // TODO: check that requests don't overwrite one another
      // (don't think this is possible to polyfill due to opaque responses)
      return Promise.all(
        responses.map(function (response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function () {
      return undefined;
    });
  };

  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}());
