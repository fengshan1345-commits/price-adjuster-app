# 阿里云号码认证登录系统 - 部署指南

## 🎯 功能概述

已成功集成阿里云号码认证服务，实现一键登录功能：
- ✅ 用户无需输入验证码，授权后0.5秒完成登录
- ✅ 自动获取真实手机号，无需手动输入
- ✅ 支持开发模式（模拟登录）和生产模式（真实认证）
- ✅ 与现有会员系统完全集成

## 📁 文件结构

```
deploy/
├── netlify/functions/
│   ├── auth/
│   │   ├── verify-phone.js      # 验证手机号 token
│   │   └── me.js                # 获取用户信息
│   └── utils/
│       ├── aliyun-client.js     # 阿里云 API 客户端
│       └── jwt.js               # JWT 工具函数
├── index.html                   # 主应用（已集成前端代码）
├── env.example                  # 环境变量示例
└── README-phone-auth.md         # 本文档
```

## ⚙️ 环境变量配置

### 1. 在 Netlify 控制台配置环境变量

登录 Netlify → 选择项目 → Site settings → Environment variables → Add variable：

| 变量名 | 值 | 说明 |
|--------|----|----|
| `ALIYUN_ACCESS_KEY_ID` | `LTAI5t9...` | 您的阿里云 AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | `EC...` | 您的阿里云 AccessKey Secret |
| `ALIYUN_PHONE_SCENE_CODE` | `FC220000012450005` | 您的方案 Code |
| `JWT_SECRET` | `随机强密钥` | JWT 签名密钥（建议32位随机字符串） |
| `CORS_ALLOW_ORIGIN` | `https://your-domain.netlify.app` | 前端域名（允许跨域） |
| `NODE_ENV` | `development` | 开发模式（设为 `production` 启用真实认证） |

### 2. 生成 JWT_SECRET

```bash
# 方法1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2：使用在线工具
# 访问 https://generate-secret.vercel.app/32
```

## 🚀 部署步骤

### 1. 上传文件到 Netlify

将 `deploy` 文件夹中的所有文件上传到 Netlify：
- 方式1：拖拽到 Netlify 控制台
- 方式2：连接 GitHub 仓库自动部署
- 方式3：使用 Netlify CLI

### 2. 配置环境变量

按上述表格在 Netlify 控制台添加所有环境变量。

### 3. 重新部署

配置完环境变量后，触发重新部署：
- 方式1：在 Netlify 控制台点击 "Deploy site"
- 方式2：推送代码到连接的 Git 仓库

## 🧪 测试流程

### 开发模式测试（当前）

1. 打开应用：`https://your-domain.netlify.app`
2. 进入"设置"页面
3. 点击"📱 一键登录"按钮
4. 在弹窗中点击"模拟登录成功"
5. 验证：用户卡片应显示"138****1234 | 免费用户"

### 生产模式测试（2个工作日后）

1. 将环境变量 `NODE_ENV` 改为 `production`
2. 重新部署应用
3. 在移动设备上打开应用（必须使用移动网络）
4. 点击"📱 一键登录"
5. 授权后应自动获取真实手机号并登录

## 🔧 故障排除

### 常见问题

1. **"SDK 加载失败"**
   - 检查网络连接
   - 确认阿里云 SDK CDN 可访问

2. **"登录失败：Internal server error"**
   - 检查 Netlify Functions 日志
   - 确认环境变量配置正确
   - 验证 AccessKey 权限

3. **"Phone verification failed"**
   - 确认方案 Code 正确
   - 检查运营商审核状态（需要2个工作日）
   - 确认在移动网络环境下测试

4. **CORS 错误**
   - 检查 `CORS_ALLOW_ORIGIN` 环境变量
   - 确认域名格式正确（包含 https://）

### 调试方法

1. **查看 Netlify Functions 日志**
   - Netlify 控制台 → Functions → 选择函数 → View logs

2. **浏览器控制台**
   - F12 → Console 查看前端错误

3. **网络请求**
   - F12 → Network 查看 API 调用状态

## 📱 移动端优化

### PWA 安装

1. 在手机浏览器中打开应用
2. 点击浏览器菜单 → "添加到主屏幕"
3. 安装后可从桌面直接启动

### 网络要求

- **必须使用移动网络**（4G/5G）
- WiFi 环境下无法使用号码认证
- 支持中国移动、联通、电信

## 🔄 从开发模式切换到生产模式

### 步骤

1. **等待运营商审核**（2个工作日）
2. **修改环境变量**：
   ```
   NODE_ENV=production
   ```
3. **重新部署应用**
4. **测试真实认证**

### 验证生产模式

- 在移动设备上测试
- 确认能获取真实手机号
- 验证登录流程完整

## 📊 监控与维护

### 关键指标

- 登录成功率
- API 调用次数
- 错误日志数量

### 定期检查

- 阿里云控制台 → 号码认证 → 用量统计
- Netlify Functions 调用日志
- 用户反馈

## 🆘 技术支持

如遇问题，请提供：
1. 错误截图
2. 浏览器控制台日志
3. Netlify Functions 日志
4. 测试环境（开发/生产）

---

## ✅ 完成状态

- [x] 后端 API 开发完成
- [x] 前端集成完成
- [x] 开发模式测试通过
- [ ] 生产模式测试（等待运营商审核）
- [ ] 性能优化
- [ ] 监控告警

**当前状态：开发完成，等待运营商审核后启用生产模式**





