
module.exports = function iterator(originList, callback) {
  if (originList && originList.length) {
    var list = originList.slice();
    var item = list.shift();
    var next = function() {
      iterator(list, callback);
    };
    callback(item, next, list);
  }
};
