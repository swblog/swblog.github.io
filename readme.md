## swBlog
一个基于service worker和单页面应用（SPA）的博客系统


##特性
1. 静态, 可部署在githbu.io或cdn服务器上
2. Markdown
3. 支持book与普通的博客展示模式
4. 支持离线阅读
5. 支持文章搜索甚至离线搜索

##示例
1、本项目是一个示例：<a href="https://swblog.github.io/" target="_blank">https://swblog.github.io/</a>

项目地址：<a href="https://github.com/swblog/swblog" target="_blank">https://github.com/swblog/swblog</a>

2、作者博客主页是另一个示例： <a href="https://liquidliang.github.io/#!/index" target="_blank">https://liquidliang.github.io/#!/index</a>

项目地址：<a href="https://github.com/liquidliang/liquidliang.github.io" target="_blank">https://github.com/liquidliang/liquidliang.github.io</a>


## 使用方式

1. 从上面两个示例中选一个，fork一份到你的仓库,更改项目名称为`your_name.github.io`,几分钟后Github会自动为你开通<a href="https://github.com/liquidliang/liquidliang.github.io" target="_blank">your_name.github.io</a>的个人主页

2. 安装nodejs环境[http://nodejs.org](http://nodejs.org "nodejs.org. ")

3. 通过Git的命令行(Git Bash)把your_name.github.io项目clone到本地

4. 在`./blog`目录下创建markdown格式的文章, 支持多级目录，系统会自动根据目录名生成文章的类别和标签。

5. 在Git的命令行(Git Bash)中执行`npm run update`。该命令会遍历`./blog`目录中的内容，生成`./json/article.json`文件。博客系统需要依赖该文件进行内容的展示。然后，该命令会自动执行git相关代码，把变更push到远程仓库。后面使用中，修改或添加文章后，只需执行该命令即可。

6. 系统配置文件是`./json/config.json`可以按需修改。配置文件的改动会在第二次访问后生效。

## 注意事项
1. 执行`npm run update`把变更push到远程仓库后，在你的博客中不会马上生效，需要等待几分钟。Github会对你提交的代码进行检查，检查通过了才会生效。

2. 博客的文件名，如果是全英文的话，不要出现大写字母，如果有存在中文则不受此限制。因为全英文的文件名，Github.io会强制要求用小写来访问。

## 许可
MIT
