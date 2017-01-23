 //顶部导航
module.exports = function(option) {
  let viewHeader = $('<header class="navbar navbar-inverse navbar-fixed-top bs-docs-nav" role="banner"></header>');
  option = $.extend({
    name: 'common/header',
    url: './json/config.json',
    update: 'd',
    template: '  <div class="container">' +
      '    <div class="navbar-header">' +
      '      <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">' +
      '        <span class="sr-only">Toggle navigation</span>' +
      '        <span class="icon-bar"></span>' +
      '        <span class="icon-bar"></span>' +
      '        <span class="icon-bar"></span>' +
      '      </button>' +
      '      <a href="#!/index" class="logo-link" style="padding: 12px;"><%-obj.author%>的博客</a>' +
      '    </div>' +
      '    <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">' +
      '      <ul class="nav navbar-nav"><%(obj.nav || []).forEach(function(o){%>' +
      '        <li class="<%=location.hash==o[1] ? "active" : ""%>"><a href="<%=o[1]%>"><%-o[0]%></a></li>' +
      '        <%})%>' +
      '      </ul>' +
      '    </nav>' +
      '  </div>'
  }, option);
  return viewHeader.setView(option);
};
