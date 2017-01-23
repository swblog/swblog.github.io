 //顶部导航
module.exports = function(option) {
  let viewHeader = $('<footer></footer>');
  option = $.extend({
    name: 'common/footer',
    template:
        '<div class="container">'+
        '  <hr>'+
        '  <p class="text-center">Copyright <%-obj.author%> © <%=new Date().getFullYear()%>. All rights reserved.</p>'+
        '</div>'
  }, option);
  return viewHeader.setView(option);
};
