# NangaiOS — 网页电脑

NangaiOS 是一个运行在浏览器中的轻量网页桌面，面向 iPad、iPhone 和电脑浏览器。项目采用纯 HTML、CSS 和 JavaScript，不需要安装软件，也不需要 Node.js 后端。

## 桌面功能

- 液态玻璃风格桌面、动态壁纸和 Dock
- 文件管理器与浏览器本地文件工作区
- 代码编辑器和 HTML 预览
- 模拟终端
- AI 助手界面
- 本地便签
- 系统外观、壁纸和亮度设置
- 窗口拖动、缩放和最大化

## 在线使用

GitHub Pages 部署完成后打开：

https://wzh131213-dev.github.io/yinpinceshi/

## 部署

仓库通过 GitHub Actions 将网页发布到 GitHub Pages。首次配置请进入仓库 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**，然后在 **Actions** 中确认部署工作流成功。

## 说明

- 本项目是浏览器中的桌面模拟体验，不是完整的真实操作系统。
- 文件与便签等数据主要保存在当前浏览器中；清除网站数据可能导致本地数据丢失。
- AI 助手界面不代表已经连接真实 AI API；如需接入模型，需另行配置服务。
- 项目不再包含 APK 上传、Android 云端运行、Emutize API 或 Node.js 后端。
