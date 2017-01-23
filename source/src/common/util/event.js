/**
 * @module {Object} event  事件相关的处理函数
 * @return {object} 方法集合
 * @property {function} stopBubble 停止冒泡并禁止默认事件
 * @property {function} stopBubbleEx 停止冒泡
 * @author ljquan@qq.com
 */

module.exports = {
    /**
     * 停止冒泡并禁止默认事件
     * @param  {event} e 事件
     * @return {null}
     */
    stopBubble: function(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
    },
    /**
     * 停止冒泡
     * @param  {event} e 事件
     * @return {null}
     */
    stopBubbleEx: function(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
    }
};
