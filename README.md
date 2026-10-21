# NangaiOS 1.1 — 云端 APK 运行版

保留原有液态玻璃桌面、Dock、终端、文件、代码、便签、设置与窗口管理；APK 管理器升级为云端 Android 运行流程。

## 现在可以做什么

1. 在桌面打开 **APK 管理器**。
2. 设置 NangaiOS 后端地址和管理员提供的访问密码（同域部署时 API 地址通常自动填充）。
3. 选择 APK，填写准确的 Android 包名，例如 `com.example.app`，点击“运行”。
4. 后端把 APK 上传到云端 Android 服务，创建独立设备会话，并把交互式 Android 画面嵌入 NangaiOS 窗口。
5. 使用完点击“结束会话”，释放云端设备资源。

## 架构

- `index.html`：原有 NangaiOS 桌面 + 云端 APK 管理器。
- `server.js`：Node.js API，负责密码校验、APK 上传、云端会话创建与销毁；也托管网页。
- `package.json`：后端依赖与启动脚本。
- `.env.example`：环境变量模板。
- `Dockerfile`：容器部署入口。

本项目已把 Emutize 的 `POST /api/v1/sessions/` 会话创建调用写入 `server.js` 的 `createEmutizeSession()`，并接入 APK 上传流程：先把 APK 上传到应用库，再创建新设备会话，最后将 `embed_url` 返回给前端 iframe。服务器端保存 `EMUTIZE_API_KEY`，绝不将该密钥发送给浏览器。参考：[Emutize Embedding Guide](https://emutize.com/docs/embed) 与 [API Reference](https://www.emutize.com/docs/api)。

## 部署条件

需要：

- Node.js 20 或更高版本（或支持此 Dockerfile 的容器平台）。
- 一个可用的 Emutize 服务账号和 API key。
- 服务器环境变量 `EMUTIZE_API_KEY`、`APP_ACCESS_PASSWORD`。
- 生产环境设置 `ALLOWED_ORIGINS` 为准确的 NangaiOS 网站来源；若网页由本服务同域托管，可设置为服务的 HTTPS origin。
- 在 Emutize 服务端把你的 NangaiOS HTTPS 域名加入 iframe 的 `EMBED_FRAME_ANCESTORS` 允许列表，否则嵌入窗口可能空白。
- 公开部署必须使用 HTTPS。不要把 `.env` 提交到 GitHub。

### 运行方式

```bash
cp .env.example .env
# 编辑 .env，填入真实 EMUTIZE_API_KEY 和足够长的 APP_ACCESS_PASSWORD
npm install
npm start
```

打开服务的 HTTPS 地址。`GET /api/health` 可查看 API 是否可用及配置是否齐全（不会返回密钥）。`ALLOWED_ORIGINS` 示例必须替换为你实际部署的 origin。若通过 GitHub Pages 单独托管前端，需把 `ALLOWED_ORIGINS` 设为 GitHub Pages 的完整来源，并在 APK 管理器填写后端 HTTPS 地址。

## APK 兼容与限制

- 云端服务当前文档要求 APK 包含 **x86_64 ABI**；仅含 ARM 原生库的 APK 可能安装失败或无法运行。
- APK 必须提供准确的 Android 包名，供云端运行服务安装并自动启动。
- 依赖 Google Play 服务、Play Integrity、DRM、SIM、蓝牙、相机、传感器、特定 GPU 或其他实体硬件的 App 可能无法正常工作。
- 这是云端 Android 设备串流，不是把 APK 转换成网页。iPad/iPhone 需要联网并使用支持 iframe/触控的现代 Safari/Chrome；体验受网络延迟、服务容量和云端配额影响。
- 云端会话按服务提供方规则自动超时；应在使用后主动结束。会话 URL 是敏感控制链接，不要分享。
- 后端示例将会话映射保存在进程内存中；若服务重启，旧会话无法通过本后端映射正常结束，服务端仍可能按其超时策略清理。
- 访问密码是轻量访问门槛，不是多用户身份系统。若对外提供多人使用，需要增加账号系统、会话隔离、速率限制、配额与审计。
- 只上传你有权使用且来源可信的 APK；服务会将 APK 传送到所配置的云端服务。

## 安全提示

- `EMUTIZE_API_KEY` 只能存在后端环境变量中。
- 设置强 `APP_ACCESS_PASSWORD`，并配置 `ALLOWED_ORIGINS` 白名单。
- 不要在公共电脑上保存访问密码；浏览器只将密码保存在当前标签页的 `sessionStorage`。
- 此示例尚未实现正式的用户注册、多租户隔离、账单/配额管理和生产级速率限制。

## 检查

请查看 `TEST_REPORT.md`。本项目的代码静态检查不代表已连接真实云端账号；实际 APK 运行必须在填入有效密钥、完成服务端 iframe 来源白名单配置并部署后验证。
