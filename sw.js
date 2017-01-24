var version = 'v6';
var namePrefix = 'swblog-';
var nameReg = new RegExp('^'+namePrefix);
var businessCacheName = namePrefix + 'business-' + version;

var expectedCaches = [
  businessCacheName,    //业务代码  对于开发者常变
  namePrefix + 'lib',   //各种引用库的资源 不常变
  namePrefix + 'markdown', //文章资源 根据规则变
  namePrefix + 'json' //配置资源 时效性强
];
//正则匹配缓存文件
var regDict = {
  lib: /\.js$|\.css$|\.html$|\.woff$/,
  markdown: /\.md$/,
  json: /\.json$/
};

//安装文件
var FILES = [
  '/',
  '/index.html',
  '/source/lib/blog.css',
  '/source/lib/bcd.min.js',
  '/source/dist/index.js'
];


self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(businessCacheName).then(function(cache) {
    return cache.addAll(FILES);
  }));
});

self.addEventListener('activate', function(event) {
  if (self.clients && clients.claim) {
    clients.claim();
  }

  // 删除掉当前定义前缀中不在expectedCaches中的缓存集
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (nameReg.test(cacheName) && expectedCaches.indexOf(cacheName) == -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


//更新缓存
var addToCache = function(dbName, req, response) {

  return fetch(req.clone()).then(function(resp) {

    var cacheResp = resp.clone();
    if (resp.status !== 200 || (resp.type !== 'basic' && resp.type !== 'cors')) {
      return resp;
    }
    caches.open(dbName).then(function(cache) {
      cache.put(req.clone(), cacheResp);
    });
    return resp;
  }).catch(function(error){
    return caches.open(dbName).then(function(cache) {
        return cache.match(req.clone());
    }).then(function(response) {
      if (response) {//如果命中缓存，直接使用缓存
        return response;
      } else {
        // Respond with a 400 "Bad Request" status.
        console.log(`fetch failed: ${ req.url }`, error);
        return new Response(new Blob, { 'status': 400, 'statusText': 'Bad Request' });
      }
    });
  });
};


var fetchCache = function(key, req){
  var dbName = namePrefix + key;
  return caches.open(dbName).then(function(cache) {
      return cache.match(req.clone());
  }).then(function(response) {
    if (response) {//如果命中缓存，直接使用缓存
      if(key=='markdown'){
        addToCache(dbName, req);
      }else if(key=='json'){
        return addToCache(dbName, req, response);
      }
      return response;
    } else {
      return addToCache(dbName, req);
    }
  });
}
self.addEventListener('fetch', function(event) {

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

  if(FILES.indexOf(requestURL.pathname)>-1){
    return event.respondWith(fetchCache(businessCacheName.replace(namePrefix, ''), req));
  }

  for(var key in regDict){
    if(regDict[key].test(url)){
      return event.respondWith(fetchCache(key, req));
    }
  }

  return event.respondWith(fetch(req));

});

(function() {
  var nativeAddAll = Cache.prototype.addAll;
  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);

  // Has nice behavior of `var` which everyone hates
  if (userAgent) {
    var agent = userAgent[1];
    var version = parseInt(userAgent[2]);
  }

  // Start polyfill hack
  //https://github.com/jakearchibald/offline-news-service-worker 未知使用情景
  if (!CacheStorage.prototype.match) {
    // This is probably vulnerable to race conditions (removing caches etc)
    CacheStorage.prototype.match = function match(request, opts) {
      var caches = this;

      return this.keys().then(function(cacheNames) {
        var match;

        return cacheNames.reduce(function(chain, cacheName) {
          return chain.then(function() {
            return match || caches.open(cacheName).then(function(cache) {
              return cache.match(request, opts);
            }).then(function(response) {
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
      (agent === 'Chrome'  && version >= 50)
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

    return Promise.resolve().then(function() {
      if (arguments.length < 1) throw new TypeError();

      // Simulate sequence<(Request or USVString)> binding:
      var sequence = [];

      requests = requests.map(function(request) {
        if (request instanceof Request) {
          return request;
        }
        else {
          return String(request); // may throw TypeError
        }
      });

      return Promise.all(
        requests.map(function(request) {
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
    }).then(function(responses) {
      // If some of the responses has not OK-eish status,
      // then whole operation should reject
      if (responses.some(function(response) {
        return !response.ok;
      })) {
        throw new NetworkError('Incorrect response status');
      }

      // TODO: check that requests don't overwrite one another
      // (don't think this is possible to polyfill due to opaque responses)
      return Promise.all(
        responses.map(function(response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function() {
      return undefined;
    });
  };

  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}());
