## swBlog
一个基于service worker和单页面应用（SPA）的博客系统


##特性
1. 静态, 可部署在githbu.io或cdn服务器上
2. Markdown
3. 支持离线阅读
4. 支持文章搜索甚至离线搜索

##示例
1、本项目是一个示例：<a href="https://swblog.github.io/#!/index" target="_blank">https://swblog.github.io/#!/index</a>

项目地址：<a href="https://github.com/swblog/swblog.github.io" target="_blank">https://github.com/swblog/swblog.github.io</a>

2、作者博客主页是另一个示例： <a href="https://liquidliang.github.io/#!/index" target="_blank">https://liquidliang.github.io/#!/index</a>

项目地址：<a href="https://github.com/liquidliang/liquidliang.github.io" target="_blank">https://github.com/liquidliang/liquidliang.github.io</a>


## 使用方式

1. 从上面两个示例中选一个，fork一份到你的仓库,更改项目名称为`your_name.github.io`,几分钟后Github会自动为你开通<a href="https://github.com/liquidliang/liquidliang.github.io" target="_blank">your_name.github.io</a>的个人主页
2. 安卓nodejs环境[http://nodejs.org](http://nodejs.org "nodejs.org. ")
3. 通过Git Bash把your_name.github.io项目clone到本地
4. 把文章内容写在markdown文件中,保存到`./blog`目录下, 支持多级目录，系统会自动根据目录生成文章的类别和标签。
5. 在Git Bash命令行中执行`npm run update`。该命令会遍历`./blog`目录中的内容，生成`./json/article.json`文件，博客系统需要依赖该文件进行内容的展示。之后，该命令会执行git相关代码，把变更push到远程仓库。后面修改或添加文章后，只需执行该命令即可。


## 许可
MIT
	




