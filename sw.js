var version = 'v21';
var namePrefix = 'swblog-';
var nameReg = new RegExp('^' + namePrefix);
var businessKey = 'business-' + version;
var businessCacheName = namePrefix + businessKey;
var imageCacheName = namePrefix + 'image';

var expectedCaches = [
  businessCacheName, //业务代码  对于开发者常变，先用缓存，同时更新，下次进来再用新的。
  namePrefix + 'lib', //各种引用库的资源 不常变
  namePrefix + 'markdown', //文章资源 根据规则变
  imageCacheName  //图片资源，由于没办法完全从链接判断是否为图片，回包后再判断是否缓存
];
//正则匹配缓存文件
var regDict = {
  lib: /\.js$|\.css$|\.html$|\.woff|\.woff2$/,
  markdown: /\.md$|\.md\?[^?]+$/
};

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
      cache.put(req.clone(), cacheResp);
    });
    return resp;
  }).catch(function (error) {
    if (response) { //请求失败用缓存保底
      console.log(`[ServiceWorker] fetch failed (${ req.url }) and use cache`, error);
      return response;
    } else {
      return caches.open(dbName).then(function(cache) {
        //取旧缓存
        let urlKey = req.url.replace(/\?[^?]+/,'');
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


var fetchCache = function (key, req) {
  var dbName = namePrefix + key;
  return caches.open(dbName).then(function (cache) {
    return cache.match(req.clone());
  }).then(function (response) {
    if (response) {
      if (key == businessKey) {
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
    return event.respondWith(fetchCache(businessKey, req));
  }

  for (var key in regDict) {
    if (regDict[key].test(url)) {
      return event.respondWith(fetchCache(key, req));
    }
  }

  if(requestURL.protocol!='https:' || /\.json$/.test(url)){
    return;
  }

  return event.respondWith(fetchCache('image', req));

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
//静态资源预加载（不支持返回内容与search参数相关的接口预加载）
var preloadList = function (msgObj) {
  let retDict = {};
  return new Promise(function (resolve) {
    iterator(msgObj.list, function (url, next, list) {
      let myRequest = new Request(url);
      for (var key in regDict) {
        if (regDict[key].test(url)) {
          let dbName = namePrefix + key;
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
              caches.open(dbName).then(function (cache) {
                //删除旧的博客文件
                let urlKey = encodeURI(url.replace(/\?[^?]+/, ''));
                cache.keys().then(function (oldReqList) {
                  oldReqList.filter(oldReq => oldReq.url.indexOf(urlKey) > -1)
                    .sort((a, b) => {
                      try {
                        return parseInt(b.url.substr(-13)) - parseInt(a.url.substr(-13));
                      } catch (e) {
                        return 0;
                      }
                    }).slice(1).forEach(function (oldReq) {
                      cache.delete(oldReq);
                    });
                });
              });
            }
            if (list.length) {
              setTimeout(next, 10);
            } else {
              var pList = [];
              var urlList = [];
              for (var key in retDict) {
                pList.push(retDict[key]);
                urlList.push(key);
              }
              Promise.all(pList).then(function (tList) {
                var rDict = {};
                tList.forEach(function (t, i) {
                  rDict[urlList[i]] = t;
                });
                resolve(rDict);
              })
            }
          });
          break;
        }
      }
    });
  });
};


//sw与页面通信
function _processMessage(msgObj) {
  switch (msgObj.m) {
  case 'preload':
    return preloadList(msgObj);
  case 'delete_not_exist_article':
    let articleDict = msgObj.dict;
    if (!articleDict) {
      return new Promise(function () {});
    }
    return caches.open(namePrefix + 'markdown').then(function (cache) {
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
      resolve({
        ms: 'msgObj.m=' + msgObj.m + ' match nothing!'
      });
    });
  }
}
// Listen for messages from clients.
self.addEventListener('message', function (event) {
  // Get all the connected clients and forward the message along.
  var promise = self.clients.matchAll()
    .then(function (clientList) {
      // event.source.id contains the ID of the sender of the message.
      // `event` in Chrome isn't an ExtendableMessageEvent yet (https://slightlyoff.github.io/ServiceWorker/spec/service_worker/#extendablemessage-event-interface),
      // so it doesn't have the `source` property.
      // https://code.google.com/p/chromium/issues/detail?id=543198
      var senderID = event.source ? event.source.id : null; //在低版本中可能没有“source”属性
      let {
        cbid,
        req
      } = event.data;
      _processMessage(req).then(function (resp) {
        // We'll also print a warning, so users playing with the demo aren't confused.
        if (senderID === null) {
          console.log('event.source is null; we don\'t know the sender of the ' +
            'message');
          clientList.forEach(function (client) {
            client.postMessage({
              cbid,
              resp
            });
          });
        } else {
          clientList.some(function (client) {
            // Skip sending the message to the client that sent it.
            if (client.id === senderID) {
              client.postMessage({
                cbid,
                resp
              });
              return true;
            }
          });
        }
      });
    });

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
