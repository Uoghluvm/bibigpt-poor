# BibiGPT 自动化系统

🤖 一个完全自动化的BibiGPT视频总结系统，支持自动注册、视频链接处理、内容保存等功能。

## ✨ 功能特性

### 🚀 核心功能
- **自动注册** - 智能生成邮箱并完成BibiGPT注册
- **CSV链接处理** - 读取CSV文件中的YouTube/B站链接
- **智能广告拦截** - 自动检测并关闭各种弹窗和遮罩层
- **内容页面监控** - 自动检测content页面并处理
- **完整内容保存** - 保存HTML、CSS、JS、截图、PDF等完整内容

### 🛡️ 智能拦截系统
- **模态弹窗拦截** - 自动按ESC关闭弹窗
- **Driver Overlay处理** - 专门处理引导遮罩层
- **CSS预防拦截** - 从源头隐藏广告元素
- **实时DOM监听** - 动态检测新出现的干扰元素

### 💾 内容保存功能
- **HTML源码** - 完整的页面结构
- **CSS样式** - 所有样式表和内联样式
- **JavaScript代码** - 页面脚本内容
- **全页截图** - PNG格式高清截图
- **PDF文档** - 可打印的PDF版本
- **离线查看** - 自包含的HTML文件
- **元数据信息** - 页面详细信息

## 📁 项目结构

```
BIBIGPT/
├── main.js                    # 主程序入口
├── package.json              # 项目配置
├── youtube-2025-09-01.csv    # YouTube链接数据
├── README.md                 # 项目说明
├── modules/                  # 功能模块
│   ├── email-generator.js    # 邮箱生成模块
│   ├── ad-blocker.js        # 广告拦截模块
│   ├── form-filler.js       # 表单填写模块
│   ├── csv-reader.js        # CSV文件读取模块
│   └── page-saver.js        # 页面保存模块
└── saved-pages/             # 保存的页面内容
    └── [timestamp]/         # 按时间戳分类的保存目录
        ├── index.html       # 原始HTML
        ├── offline.html     # 离线查看版本
        ├── screenshot.png   # 页面截图
        ├── page.pdf        # PDF文档
        ├── styles.css      # CSS样式
        ├── scripts.js      # JavaScript代码
        └── metadata.json   # 元数据信息
```

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
npm install playwright
```

### 安装浏览器
```bash
npx playwright install chromium
```

### 准备CSV文件
确保项目根目录有 `youtube-2025-09-01.csv` 文件，格式如下：
```csv
链接,标题,描述
https://www.youtube.com/watch?v=VIDEO_ID,视频标题,视频描述
```

### 运行系统
```bash
node main.js
```

## 📊 工作流程

### 第一阶段：自动注册
1. 🌐 访问BibiGPT注册页面
2. 🛡️ 启动广告拦截系统
3. 📧 生成随机邮箱地址
4. 📝 自动填写注册表单
5. ✅ 提交注册信息

### 第二阶段：视频链接处理
1. 📊 读取CSV文件数据
2. 🎯 提取第一列第二行链接
3. 🌐 导航到BibiGPT桌面版
4. 📝 输入视频链接
5. ⌨️ 按Enter提交处理

### 第三阶段：内容监控和保存
1. 👀 监控URL变化，等待content页面
2. ⌨️ 按ESC键处理遮罩层（间隔3秒按两次）
3. ⏰ 等待内容稳定
4. 💾 保存完整页面内容

## ⚙️ 配置选项

### 主要配置
```javascript
this.config = {
    registerUrl: 'https://bibigpt.co/r/bilibili',  // 注册页面
    desktopUrl: 'https://bibigpt.co/desktop',      // 桌面版页面
    csvFilePath: 'youtube-2025-09-01.csv',        // CSV文件路径
    headless: false,                               // 是否无头模式
    slowMo: 500,                                   // 操作延迟
    timeout: 30000                                 // 超时时间
};
```

### 自定义CSV文件
修改 `main.js` 中的 `csvFilePath` 配置：
```javascript
csvFilePath: 'your-custom-file.csv'
```

## 🛡️ 广告拦截机制

### CSS预防拦截
- 直接隐藏已知的广告元素
- 处理模态弹窗和遮罩层
- 禁用pointer-events防止误点击

### DOM动态监听
- 实时检测新添加的元素
- 自动识别弹窗特征
- 立即执行关闭操作

### ESC键标准关闭
- 符合无障碍设计标准
- 适用于大多数模态弹窗
- 定时和条件触发

## 💾 保存内容说明

### 文件类型
- **index.html** - 原始页面HTML源码
- **offline.html** - 包含所有CSS/JS的离线版本
- **screenshot.png** - 全页面高清截图
- **page.pdf** - A4格式PDF文档
- **styles.css** - 提取的所有CSS样式
- **scripts.js** - 页面JavaScript代码
- **metadata.json** - 页面元数据和保存信息

### 查看保存内容
1. 打开 `saved-pages/` 目录
2. 选择对应时间戳的文件夹
3. 双击 `offline.html` 离线查看
4. 或查看其他格式的保存文件

## 🔧 故障排除

### 常见问题

**Q: 浏览器无法启动**
A: 确保已安装Playwright浏览器：`npx playwright install chromium`

**Q: CSV文件读取失败**
A: 检查文件路径和格式，确保CSV文件存在且格式正确

**Q: 注册失败**
A: 检查网络连接，确保BibiGPT网站可访问

**Q: 页面保存失败**
A: 确保有足够的磁盘空间，检查文件写入权限

### 调试模式
设置 `headless: false` 可以看到浏览器操作过程，便于调试。

## 📝 更新日志

### v1.0.0
- ✅ 基础自动注册功能
- ✅ CSV链接读取和处理
- ✅ 智能广告拦截系统
- ✅ Content页面监控
- ✅ 完整内容保存功能
- ✅ Driver Overlay专项处理

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## ⚠️ 免责声明

本工具仅供学习和研究使用，请遵守相关网站的使用条款和法律法规。使用者需对自己的行为负责。

---

🎉 **享受自动化的便利！** 如有问题，请查看故障排除部分或提交Issue。
