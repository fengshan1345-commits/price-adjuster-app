# 纯价格识别器 - Netlify 部署

## 📱 部署步骤

### 1. 生成图标
- 打开 `generate-icons.html`
- 点击"生成图标文件"按钮
- 下载 `icon-192.png` 和 `icon-512.png`
- 将图标文件放在此目录下

### 2. 部署到 Netlify
1. 访问 [netlify.com](https://netlify.com)
2. 点击 "Deploy a site" 或 "New site from Git"
3. 选择 "Deploy manually" 或 "Deploy from folder"
4. 将整个 `deploy` 文件夹拖拽到 Netlify 部署区域
5. 等待部署完成（约1-2分钟）

### 3. 获得访问链接
- Netlify 会提供一个随机域名，如：`https://amazing-name-123456.netlify.app`
- 点击链接即可访问应用

### 4. 安装到手机
1. 用手机浏览器打开 Netlify 提供的链接
2. 点击浏览器菜单 → "添加到主屏幕" 或 "安装应用"
3. 应用会像原生APP一样安装到手机桌面

## 📁 文件清单
- `pure-price-parser.html` - 主应用文件
- `manifest.json` - PWA配置
- `sw.js` - Service Worker
- `icon-192.png` - 小图标（需要生成）
- `icon-512.png` - 大图标（需要生成）

## ✅ 验证成功
- 应用可以离线使用
- 可以添加到手机主屏幕
- 全屏显示，无浏览器界面
- 支持所有价格识别功能
