const m_event = require('./event');
const getTime = function(date) {
  date = new Date(date);
  var now = new Date();
  var diff = now - date;
  switch (true) {
    case diff < 6E4:
      return '刚刚';
    case diff < 36E5:
      return Math.round(diff / 6E4) + '分钟前';
    case diff < 864E5:
      return Math.round(diff / 36E5) + '小时前';
    case diff < 1728E5 && now.getDate() - date.getDate() != 2:
      return '昨天';
    case date.getFullYear() === new Date().getFullYear():
      return BCD.time.formatDate(date, "%M月%d日");
    default:
      return BCD.time.formatDate(date, "%y年%M月%d日");
  }
};

const leftFillString = function(num, length) {
  return ("0000000000" + num).substr(-length);
};
const getRandomName = function() {
  return ("aaaaaaaaaa" + Math.random().toString(36).replace(/[.\d]/g, '')).substr(-10)
};
module.exports = {
  getTime,
  leftFillString,
  getRandomName,
  stopBubble: m_event.stopBubble,
  stopBubbleEx: m_event.stopBubbleEx
};
