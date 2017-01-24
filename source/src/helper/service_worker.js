
if( 'serviceWorker' in navigator ){
    // 注册Service Worker scope表示作用的页面的path
    // register函数返回Promise
    navigator.serviceWorker.oncontrollerchange = function() {
      this.controller.onstatechange = function() {
        if (this.state === 'activated') {
          //todo
        }
        console.log('ServiceWorker state:' + this.state);
      };
      // We only care about this once.
      //navigator.serviceWorker.removeEventListener('controllerchange', changeListener);
    };
    navigator.serviceWorker.register('/sw.js', {scope: './'}).then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
} else {
    console.log('ServiceWorker is not supported in this browser.')
}
