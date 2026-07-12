# 张紫薇｜短视频剪辑作品集

这是一个纯静态个人求职作品集网站，适合展示短视频剪辑、新媒体运营、内容运营、电商内容剪辑相关作品。项目不需要数据库，也不依赖付费 API，可直接本地打开或免费部署。

## 1. 本地打开方法

直接双击 `index.html` 即可在浏览器查看。

如果浏览器限制本地视频预览，可把项目部署到 GitHub Pages、Vercel 或 Netlify 后查看，或用任意本地静态服务器打开。

## 2. 修改个人信息

所有主要内容都集中在：

`js/data.js`

可修改内容包括：

- 姓名、定位、个人简介
- 联系方式
- 求职方向与工作地点
- 关于我
- 作品列表
- 账号数据
- 项目经历
- 工作经历
- 专业技能
- 简历路径
- 二维码路径

## 3. 添加作品

打开 `js/data.js`，在 `works` 数组里复制一个作品对象，修改：

- `title`：作品名称
- `category`：作品分类
- `duration`：视频时长
- `software`：制作软件
- `responsibility`：负责内容
- `summary`：卡片简介
- `video`：视频路径
- `cover`：封面路径
- `purpose`、`source`、`thinking`、`highlights`：弹窗中的制作说明

分类名称建议保持为：

- 食品带货视频
- 明星安利类视频
- 个人自媒体作品
- 其他剪辑作品

## 4. 替换视频与封面

视频统一放在：

`assets/videos/`

封面统一放在：

`assets/covers/`

推荐视频格式：

- `.mp4`
- H.264 编码
- 单个视频尽量压缩到 20MB 以内

推荐封面比例：

- 16:9
- JPG、PNG、WebP 或 SVG 均可

然后在 `js/data.js` 里把路径改成对应文件，例如：

```js
video: "assets/videos/my-work.mp4",
videoReady: true,
cover: "assets/covers/my-work.jpg"
```

视频还没上传时，把 `videoReady` 保持为 `false`，页面会显示“作品待上传”。

## 5. 上传简历

简历文件放在：

`assets/resume/张紫薇_短视频剪辑简历.pdf`

如果文件名不同，请同步修改 `js/data.js`：

```js
resumePath: "assets/resume/你的简历文件名.pdf",
resumeUploaded: true
```

未上传简历时，点击按钮会提示：

“简历文件暂未上传，请通过联系方式获取。”

## 6. 替换二维码

二维码图片放在：

`assets/images/qrcode/`

默认预留文件名：

- `site.png`：网站二维码
- `douyin.png`：抖音二维码
- `wechat-video.png`：视频号二维码
- `wechat.png`：微信二维码

如果文件名不同，请修改 `js/data.js` 里的 `qrcodes`。

## 7. GitHub Pages 部署

1. 新建 GitHub 仓库。
2. 上传 `portfolio` 文件夹内的所有文件。
3. 进入仓库 `Settings`。
4. 找到 `Pages`。
5. Source 选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`。
7. 保存后等待生成访问链接。

## 8. Vercel 部署

1. 登录 Vercel。
2. 选择 `Add New Project`。
3. 导入 GitHub 仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空。
6. Output Directory 留空或填写 `.`。
7. 部署完成后即可获得链接。

## 9. Netlify 部署

1. 登录 Netlify。
2. 选择 `Add new site`。
3. 可直接拖拽 `portfolio` 文件夹上传。
4. 或连接 GitHub 仓库自动部署。
5. Build Command 留空。
6. Publish directory 填写 `.`。

## 10. 二维码生成方法

部署后复制网站链接，使用任意免费二维码生成工具生成二维码即可。

建议生成：

- 网站二维码
- 抖音主页二维码
- 视频号二维码
- 微信二维码

生成后把图片保存到 `assets/images/qrcode/`，并按上方文件名命名。

## 11. 常见问题排查

视频不能播放：

- 检查视频路径是否和 `js/data.js` 一致。
- 检查视频是否为浏览器常见支持格式，例如 MP4。
- 文件名不要包含多余空格。

封面不显示：

- 检查图片是否放在 `assets/covers/`。
- 检查路径大小写和后缀是否一致。

简历不能下载：

- 检查 PDF 是否放在 `assets/resume/`。
- 检查 `resumePath` 是否正确。

手机端菜单打不开：

- 确认 `js/main.js` 已正常加载。
- 不要删除页面底部的脚本引用。

页面文字需要更新：

- 优先修改 `js/data.js`，不要在多个文件里分散修改。

## 12. 后续需要替换的内容

- 真实手机号、邮箱、微信号
- 真实作品视频
- 真实作品封面
- 简历 PDF
- 网站二维码
- 抖音二维码
- 视频号二维码
- 微信二维码
- 工作经历中的公司、时间与具体职责
