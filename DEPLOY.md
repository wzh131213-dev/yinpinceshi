# NangaiOS 部署说明

本仓库同时包含静态网页前端和 Node.js 云端 API。

## 1. GitHub Pages（网页桌面预览）

工作流 `.github/workflows/deploy-pages.yml` 会在推送到 `main` 后部署根目录静态网页。首次使用时，请进入仓库 **Settings → Pages**，将 **Build and deployment → Source** 设为 **GitHub Actions**。随后在 **Actions** 标签页查看部署结果。

网页地址通常为：

`https://wzh131213-dev.github.io/yinpinceshi/`

GitHub Pages 只能托管静态文件，不能运行 `server.js`。因此这个网址能打开桌面，但 APK 云端运行必须另外部署后端。

## 2. 云端 API（Render Blueprint）

1. 使用 GitHub 账号登录/注册 Render，并从该仓库创建 Blueprint（选择此仓库）。
2. Render 会读取 `render.yaml` 并创建 Node.js Web Service。免费实例可能休眠，首次请求会等待唤醒；服务商政策可能变化。
3. 在服务的 Environment 页面设置：
   - `EMUTIZE_API_KEY`：你的 Emutize API key
   - `APP_ACCESS_PASSWORD`：设置一个强访问密码
   - `ALLOWED_ORIGINS`：填入实际 GitHub Pages 来源，例如 `https://wzh131213-dev.github.io`（不要加路径末尾斜杠）
   - `EMUTIZE_BASE_URL`：通常为 `https://app.emutize.com`
4. 保存并等待服务部署成功，打开 `https://你的服务域名/api/health` 检查状态。
5. 在 NangaiOS 桌面打开 APK 管理器，将“后端 API 地址”设为 Render 分配的 HTTPS 域名，填入访问密码并保存。
6. 在 Emutize 控制台中允许你的网页来源进行 iframe 嵌入（如有该配置），否则 Android 画面可能无法显示。

## 3. 重要限制

- 没有有效的 Emutize API key，无法创建真实 Android 会话。
- GitHub Pages 与 Node.js API 是两个独立服务；仅部署 Pages 不代表 APK 可以运行。
- 只在托管平台的环境变量设置密钥，绝不要把密钥写进 `index.html`、`README.md` 或提交到 Git。
- 免费后端可能有休眠、上传容量、运行时间和资源限制。
- 上传的 APK 会发送到你配置的云端服务。请仅上传你有权使用且来源可信的文件。
