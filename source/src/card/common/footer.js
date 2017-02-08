 //页脚
const m_config = require('model/config');
module.exports = function(option) {
  let viewHeader = $('<footer></footer>');
  option = $.extend({
    name: 'common/footer',
    getData: function() {
      return m_config.getConfigSync()
    },
    template:
        '<div class="container">'+
        '  <hr>'+
        '  <p class="text-center">Copyright <%-obj.author%> © <%=new Date().getFullYear()%>. All rights reserved.</p>'+
        '</div>'
  }, option);
  return viewHeader.setView(option);
};
