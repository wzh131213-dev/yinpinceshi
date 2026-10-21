# NangaiOS — 网页电脑

NangaiOS 是一个运行在浏览器中的轻量网页桌面，面向 iPad、iPhone 和电脑浏览器。项目采用单文件 `index.html`（HTML、CSS、JavaScript），不需要安装软件，也没有后端服务。

## 桌面功能

- 液态玻璃风格桌面、6 款渐变壁纸、可上传自定义壁纸，以及 Dock 和任务栏
- 桌面图标可拖动，位置会记在本浏览器中
- 文件管理器：查看代码编辑器保存的文件，双击即可打开
- 代码编辑器：支持 JavaScript 和 HTML 运行预览，Ctrl+Enter 运行，Ctrl+S 保存
- 模拟终端：支持 `ls`、`cat`、`run`、`date`、`echo`、`neofetch`、`glass`、`wp` 等命令，输入 `help` 查看全部
- AI 助手：通过你自己的 Google Gemini API Key 调用模型（见下文）
- AI 语音助手：内嵌第三方语音页面
- 本地便签：内容只保存在当前浏览器
- 系统设置：壁纸、液态玻璃开关、亮度
- 游戏大厅：6 个游戏站点在窗口内嵌运行
- 窗口拖动、缩放（双击标题栏或点绿色按钮最大化）

## 在线使用

GitHub Pages 部署完成后打开：

https://wzh131213-dev.github.io/yinpinceshi/

## 本地预览

直接用浏览器打开 `index.html` 即可；如需通过 HTTP 访问，可在项目目录运行：

```bash
python3 -m http.server 8000
```

然后访问 http://localhost:8000/

## 部署

仓库通过 GitHub Actions（`.github/workflows/deploy-pages.yml`）将 `index.html` 发布到 GitHub Pages。只有修改 `index.html`、`.nojekyll` 或工作流文件时才会触发部署，也可在 Actions 页面手动运行。

首次配置：进入仓库 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**，然后在 **Actions** 中确认部署工作流成功。

## 配置 AI 助手（Gemini）

1. 打开桌面上的「AI 助手」，点击右上角「API 设置」。
2. 粘贴你自己的 Gemini API Key（可在 Google AI Studio 获取）。
3. 可选：填写模型名。留空时使用默认模型 `gemini-3.8-flash`；如果该模型对你的账号不可用，请改为可用的模型名。
4. 点击「保存密钥」，然后即可对话。

说明：

- API Key 和模型名只保存在当前浏览器的本地存储中，不会写入代码仓库。请勿在公共或共用设备上保存密钥。
- 请求由浏览器直接发送到 `generativelanguage.googleapis.com`，不经过任何中间服务器。
- 对话会沿用上一轮的上下文，修改密钥或模型后会重新开始会话。

## 外部依赖

以下功能依赖第三方站点，本项目无法保证其可用性：

- **AI 语音助手**：内嵌 `wzh131213-dev.github.io/yuyanai.github.io/`。需要允许麦克风权限；若内嵌模式无法使用设备，可点击「单独打开」。
- **游戏大厅**：6 个游戏分别来自 `wzh131213-dev.github.io` 下的独立站点。若某个站点禁止被 iframe 嵌入，窗口中会加载失败，可使用「在新标签页打开游戏」。

## 说明

- 本项目是浏览器中的桌面模拟体验，不是完整的真实操作系统。
- 文件、便签、壁纸和设置等数据保存在当前浏览器的 `localStorage` 中；清除网站数据会导致这些数据丢失。
- 项目不包含后端服务、APK 上传或云端运行功能。

## 文件结构

```
.
├── index.html                        # 全部应用（HTML / CSS / JS）
├── README.md                         # 项目说明
├── TEST_REPORT.md                    # 本次测试记录
├── .nojekyll                         # 告诉 GitHub Pages 不使用 Jekyll 处理
├── .gitignore
└── .github/workflows/deploy-pages.yml  # GitHub Pages 部署工作流
```
