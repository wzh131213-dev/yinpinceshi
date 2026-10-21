# NangaiOS 测试报告

测试日期：2026-10-22
测试环境：Node.js v22.22.2；Playwright 1.56.0（无头 Chromium）；Linux 容器（无外网访问）

## 结果

- [PASS] `index.html` 存在且非空（约 64 KB，669 行）。
- [PASS] 内嵌脚本通过 `node --check` 语法检查。
- [PASS] 脚本中通过 `$()` / `getElementById()` 引用的所有元素 id 均存在于页面中。
- [PASS] 无头浏览器加载页面，未出现 `pageerror` 类型的运行时错误。
- [PASS] 文件、代码、终端、AI 助手、便签、设置、游戏大厅共 7 个窗口均可正常打开。
- [PASS] AI 助手：未配置密钥时给出提示；保存密钥和自定义模型后，请求发往 `https://generativelanguage.googleapis.com/v1beta/interactions`，携带 `x-goog-api-key` 请求头，并使用自定义模型；清空模型名后回退到默认模型 `gemini-3.8-flash`。（网络请求通过 Playwright 拦截模拟，未调用真实接口。）
- [PASS] AI 回复包含代码块时，会出现「在代码编辑器中打开」按钮（未点击验证后续跳转）。

## 未验证项

- [NOT RUN] 真实 Gemini API 调用：本次没有 API Key，且容器无外网。默认模型名 `gemini-3.8-flash` 未能在 Google 官方文档中核实，部分官方示例使用的是 `gemini-3.5-flash` / `gemini-3.6-flash`。如遇到模型不存在的错误，请在「API 设置」中改用可用的模型名。
- [NOT RUN] 游戏站点与语音助手页面的 iframe 嵌入：依赖第三方站点，需在线验证。
- [NOT RUN] GitHub Actions 部署流程：需在仓库中实际运行。
- [NOT RUN] iPad / iPhone Safari 上的触控、拖动和虚拟键盘适配：需真机测试。

## 观察到的非阻塞提示

- 打开游戏窗口时，浏览器控制台会输出 "Potential permissions policy violation"（autoplay、fullscreen 等）。这是在本地 file:// 环境下，父页面未获授予这些权限所致，不影响窗口打开。

## 已知限制

- 所有数据保存在浏览器本地，没有云端同步。
- API Key 保存在 `localStorage` 中，任何能访问该浏览器的人都可能读取。
- AI 助手对话上下文仅在当前页面会话中保持，刷新页面后会重新开始。
- 游戏和语音功能依赖外部站点的可用性和嵌入策略。
