# NangaiOS 1.1 测试报告

- [PASS] `index.html` 存在且非空。
- [PASS] `server.js` 通过 Node.js 语法检查。
- [PASS] 前端内嵌 JavaScript 通过 Node.js 语法检查。
- [PASS] 项目包含后端配置模板、package.json、Dockerfile、README。
- [PASS] 后端 API 包含访问密码校验、APK 扩展名/大小限制、包名格式校验、上传至云端服务、创建会话和结束会话路由。
- [PASS] ZIP 文件完整性检查（打包后执行）。
- [NOT RUN] `npm install` 与完整服务器启动：本次未安装依赖/启动服务器。
- [NOT RUN] 真实 Emutize API 调用：没有提供真实云端 API key。
- [NOT RUN] iPad/iPhone Safari 端到端触控、iframe 与 APK 兼容测试。
- [MANUAL VERIFICATION NEEDED] 在 Emutize 服务端配置 `EMBED_FRAME_ANCESTORS`，并在 HTTPS 部署后测试真实 APK。

## 当前已知限制

- 使用进程内存保存会话映射，后端重启后映射会丢失。
- 生产部署尚需更完善的账号、配额、速率限制和审计能力。
- APK 的 ABI、包名、系统服务和硬件依赖决定实际兼容性。
