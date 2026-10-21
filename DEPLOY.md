# NangaiOS 部署说明

NangaiOS 现在是纯静态网页电脑项目，只需要 GitHub Pages，不需要 Render、Node.js 后端、Emutize 账号或 API Key。

## GitHub Pages

1. 打开仓库 Settings → Pages。
2. 在 Build and deployment 的 Source 中选择 **GitHub Actions**。
3. 打开 Actions 标签页，等待部署工作流完成并显示成功。
4. 访问：

   https://wzh131213-dev.github.io/yinpinceshi/

## 项目内容

- `index.html`：完整的网页桌面应用。
- `.github/workflows/deploy-pages.yml`：自动发布到 GitHub Pages 的工作流。

## 使用限制

- 这是运行在浏览器中的桌面模拟体验，不是原生操作系统。
- 不包含 APK 上传和 Android 云端运行功能。
- 不需要配置 API Key 或 Render 环境变量。
- 文件和便签数据主要存储在当前浏览器本地。
