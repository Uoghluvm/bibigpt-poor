// 🚀 BibiGPT 自动化主程序
const { chromium } = require('playwright');

// 导入模块
const { EmailGenerator } = require('./modules/email-generator');
const { AdBlocker } = require('./modules/ad-blocker');
const { FormFiller } = require('./modules/form-filler');
const { CSVReader } = require('./modules/csv-reader');
const { PageSaver } = require('./modules/page-saver');

// 🎯 主自动化类
class BibiGPTAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
        this.context = null;
        
        // 初始化模块
        this.emailGenerator = new EmailGenerator();
        this.adBlocker = new AdBlocker();
        this.formFiller = new FormFiller();
        this.csvReader = new CSVReader();
        this.pageSaver = new PageSaver();
        
        // 配置
        this.config = {
            registerUrl: 'https://bibigpt.co/r/bilibili',
            desktopUrl: 'https://bibigpt.co/desktop',
            csvFilePath: 'youtube-2025-09-01.csv',
            headless: false,
            slowMo: 500,
            timeout: 30000
        };
    }

    /**
     * 初始化浏览器
     */
    async initBrowser() {
        console.log('🌐 初始化浏览器...');
        
        this.browser = await chromium.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo
        });
        
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
        
        console.log('✅ 浏览器初始化完成');
    }

    /**
     * 导航到注册页面
     */
    async navigateToRegisterPage() {
        console.log('🌐 导航到BibiGPT注册页面...');

        await this.page.goto(this.config.registerUrl, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.timeout
        });

        // 等待页面加载完成
        await this.page.waitForTimeout(2000);

        const title = await this.page.title();
        console.log(`✅ 注册页面加载完成: ${title}`);
    }

    /**
     * 导航到桌面版页面
     */
    async navigateToDesktopPage() {
        console.log('🌐 导航到BibiGPT桌面版页面...');

        await this.page.goto(this.config.desktopUrl, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.timeout
        });

        // 等待页面加载完成
        await this.page.waitForTimeout(3000);

        const title = await this.page.title();
        console.log(`✅ 桌面版页面加载完成: ${title}`);
    }

    /**
     * 设置广告拦截
     */
    async setupAdBlocking() {
        console.log('🛡️ 设置广告拦截...');

        // 1. 启动广告拦截系统
        await this.adBlocker.startBlocking(this.page);

        // 2. 强制清理广告
        await this.adBlocker.forceCleanAds(this.page);

        console.log('✅ 广告拦截设置完成');
    }

    /**
     * 自动注册流程
     */
    async autoRegister() {
        console.log('🚀 开始自动注册流程...');
        
        try {
            // 1. 检查表单是否存在
            const formCheck = await this.formFiller.checkFormExists(this.page);
            if (!formCheck.isComplete) {
                throw new Error(`表单不完整: ${JSON.stringify(formCheck)}`);
            }
            
            // 2. 生成随机邮箱
            const email = this.emailGenerator.generateTimestampEmail('bibigpt');
            console.log(`📧 生成邮箱: ${email}`);

            // 3. 再次清理广告（确保不被阻挡）
            await this.adBlocker.forceCleanAds(this.page);

            // 4. 填写表单
            const formResult = await this.formFiller.fillForm(this.page, {
                email: email,
                password: email // 使用邮箱作为密码
            }, {
                forceSubmit: true, // 强制点击，忽略遮罩层
                waitBetweenSteps: 300 // 减少步骤间等待时间，加快速度
            });
            
            if (!formResult.success) {
                throw new Error(`表单填写失败: ${formResult.error}`);
            }
            
            console.log('✅ 自动注册完成');
            console.log(`📧 注册邮箱: ${email}`);
            console.log(`🔒 注册密码: ${email}`);
            
            return {
                success: true,
                email: email,
                password: email,
                formResult: formResult
            };
            
        } catch (error) {
            console.error(`❌ 自动注册失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }



    /**
     * 处理视频链接输入
     */
    async processVideoLink() {
        console.log('');
        console.log('🔗 ==========================================');
        console.log('🔗 第二阶段：处理视频链接');
        console.log('🔗 ==========================================');

        try {
            // 1. 读取CSV文件
            console.log('📊 读取CSV文件...');

            // 检查CSV文件是否存在，如果不存在则创建示例文件
            const fs = require('fs');
            if (!fs.existsSync(this.config.csvFilePath)) {
                console.log('⚠️ CSV文件不存在，创建示例文件...');
                this.csvReader.createSampleCSV(this.config.csvFilePath);
            }

            // 读取CSV数据
            this.csvReader.readCSV(this.config.csvFilePath);

            // 获取第一列第二行的链接
            const videoLink = this.csvReader.getFirstColumnSecondRow();
            console.log(`🎯 获取到视频链接: ${videoLink}`);

            // 验证链接格式
            if (!this.csvReader.validateLink(videoLink)) {
                throw new Error(`无效的链接格式: ${videoLink}`);
            }

            // 2. 导航到桌面版页面
            await this.navigateToDesktopPage();

            // 3. 输入视频链接
            console.log('📝 输入视频链接到页面...');
            const inputResult = await this.formFiller.inputVideoLink(this.page, videoLink, {
                clearFirst: true,
                pressEnter: true,
                waitAfterInput: 1000
            });

            if (inputResult.success) {
                console.log('✅ 视频链接处理成功');
                console.log(`� 处理的链接: ${inputResult.link}`);
                console.log(`⌨️ 已按Enter提交: ${inputResult.pressedEnter}`);

                return {
                    success: true,
                    link: videoLink,
                    inputResult: inputResult
                };
            } else {
                throw new Error(`视频链接输入失败: ${inputResult.error}`);
            }

        } catch (error) {
            console.error(`❌ 处理视频链接失败: ${error.message}`);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 监控content页面并保存内容
     */
    async monitorContentPage() {
        console.log('');
        console.log('👀 ==========================================');
        console.log('👀 第三阶段：监控content页面');
        console.log('👀 ==========================================');

        try {
            console.log('🔍 开始监控页面URL变化...');

            // 等待页面跳转到content页面
            let contentPageReached = false;
            let attempts = 0;
            const maxAttempts = 30; // 最多等待30次，每次2秒

            while (!contentPageReached && attempts < maxAttempts) {
                const currentUrl = this.page.url();
                console.log(`🔗 当前URL: ${currentUrl}`);

                // 检查是否到达content页面
                if (currentUrl.includes('/content/')) {
                    console.log('✅ 检测到content页面！');
                    contentPageReached = true;
                    break;
                }

                attempts++;
                console.log(`⏰ 等待页面跳转... (${attempts}/${maxAttempts})`);
                await this.page.waitForTimeout(2000);
            }

            if (!contentPageReached) {
                throw new Error('超时：未检测到content页面');
            }

            // 等待content页面完全加载
            console.log('⏰ 等待content页面完全加载...');
            await this.page.waitForTimeout(3000);

            // 检测并关闭driver overlay
            console.log('🛡️ 检测并关闭遮罩层...');
            await this.handleDriverOverlay();

            // 等待内容稳定
            console.log('⏰ 等待内容稳定...');
            await this.page.waitForTimeout(2000);

            // 保存完整页面内容
            console.log('💾 保存完整页面内容...');
            const saveResult = await this.pageSaver.saveCompletePage(this.page);

            if (saveResult.success) {
                console.log('✅ 页面内容保存成功！');
                console.log(`📁 保存目录: ${saveResult.directory}`);
                console.log(`🌐 离线查看: ${saveResult.files.offline}`);

                return {
                    success: true,
                    url: this.page.url(),
                    saveResult: saveResult
                };
            } else {
                throw new Error(`页面保存失败: ${saveResult.error}`);
            }

        } catch (error) {
            console.error(`❌ 监控content页面失败: ${error.message}`);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 处理driver overlay遮罩层 - 按指定时序按ESC
     */
    async handleDriverOverlay() {
        try {
            console.log('🎯 开始处理遮罩层...');

            // 第一次按ESC
            console.log('⌨️ 第1次按ESC键...');
            await this.page.keyboard.press('Escape');

            // 等待3秒
            console.log('⏰ 等待3秒...');
            await this.page.waitForTimeout(3000);

            // 第二次按ESC
            console.log('⌨️ 第2次按ESC键...');
            await this.page.keyboard.press('Escape');

            // 等待1秒确保处理完成
            await this.page.waitForTimeout(1000);

            console.log('✅ 遮罩层处理完成（按ESC两次，间隔3秒）');

        } catch (error) {
            console.log(`⚠️ 处理遮罩层时出错: ${error.message}`);
        }
    }

    /**
     * 清理资源
     */
    async cleanup() {
        console.log('🧹 清理资源...');
        
        try {
            // 停止所有监控
            if (this.adBlocker.isActive) {
                await this.adBlocker.stopBlocking(this.page);
            }
            
            // 关闭浏览器
            if (this.browser) {
                await this.browser.close();
            }
            
            console.log('✅ 资源清理完成');
        } catch (error) {
            console.error(`❌ 清理过程中出现错误: ${error.message}`);
        }
    }

    /**
     * 完整的自动化流程
     */
    async run() {
        try {
            console.log('🚀 启动BibiGPT自动化系统...');
            console.log('');
            
            // 1. 初始化浏览器
            await this.initBrowser();
            
            // 2. 导航到注册页面
            await this.navigateToRegisterPage();

            // 3. 设置广告拦截
            await this.setupAdBlocking();

            // 4. 自动注册
            console.log('📝 第一阶段：自动注册');
            const registerResult = await this.autoRegister();

            if (!registerResult.success) {
                throw new Error(`自动注册失败: ${registerResult.error}`);
            }

            // 等待注册后页面稳定
            await this.page.waitForTimeout(3000);

            // 5. 处理视频链接
            const videoResult = await this.processVideoLink();

            // 6. 监控content页面并保存
            const contentResult = await this.monitorContentPage();

            console.log('');
            console.log('🎉 自动化流程完成！');

            return {
                success: true,
                register: registerResult,
                video: videoResult,
                content: contentResult
            };
            
        } catch (error) {
            console.error(`❌ 自动化流程失败: ${error.message}`);
            
            // 截图保存错误状态
            if (this.page) {
                await this.page.screenshot({ path: 'error-screenshot.png' });
                console.log('📸 错误截图已保存: error-screenshot.png');
            }
            
            return {
                success: false,
                error: error.message
            };
        } finally {
            // 保持浏览器打开，不自动关闭
            console.log('');
            console.log('🎉 流程完成！浏览器将保持打开状态，请手动关闭。');
            console.log('💡 你可以继续在浏览器中查看结果或进行其他操作。');

            // 不调用cleanup()，让浏览器保持打开
            // await this.cleanup();
        }
    }
}

// 🚀 主程序入口
async function main() {
    const automation = new BibiGPTAutomation();
    const result = await automation.run();

    if (result.success) {
        console.log('🎉 程序执行成功！');
        console.log('🌐 浏览器保持打开状态，Node.js进程继续运行...');
        console.log('💡 要完全退出，请手动关闭浏览器或按 Ctrl+C');

        // 不调用 process.exit()，让进程保持运行
        // 这样浏览器就不会被强制关闭
        return result;
    } else {
        console.log('❌ 程序执行失败！');
        console.log('🌐 浏览器可能已关闭，Node.js进程将退出');
        process.exit(1);
    }
}

// 运行主程序
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { BibiGPTAutomation };
