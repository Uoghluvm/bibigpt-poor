// 🚀 BibiGPT 自动化主程序
const { chromium } = require('playwright');

// 导入模块
const { EmailGenerator } = require('./modules/email-generator');
const { AdBlocker } = require('./modules/ad-blocker');
const { FormFiller } = require('./modules/form-filler');

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
        
        // 配置
        this.config = {
            url: 'https://bibigpt.co/r/bilibili',
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
     * 导航到目标页面
     */
    async navigateToPage() {
        console.log('🌐 导航到BibiGPT页面...');
        
        await this.page.goto(this.config.url, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.timeout
        });
        
        // 等待页面加载完成
        await this.page.waitForTimeout(2000);
        
        const title = await this.page.title();
        console.log(`✅ 页面加载完成: ${title}`);
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
                waitBetweenSteps: 1000
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
     * 点击首页按钮
     */
    async clickHomePage() {
        console.log('');
        console.log('🏠 ==========================================');
        console.log('🏠 第二阶段：点击首页按钮');
        console.log('🏠 ==========================================');

        try {
            // 等待页面稳定（3秒）
            console.log('⏰ 等待3秒后点击首页按钮...');
            await this.page.waitForTimeout(3000);

            // 点击首页按钮
            const homeResult = await this.formFiller.clickHomeButton(this.page, {
                force: true, // 强制点击，忽略可能的遮罩
                timeout: 10000,
                waitAfterClick: 3000
            });

            if (homeResult.success) {
                console.log('✅ 成功跳转到首页');
                console.log(`📍 页面标题: ${homeResult.title}`);
                console.log(`🔗 页面URL: ${homeResult.url}`);

                return {
                    success: true,
                    title: homeResult.title,
                    url: homeResult.url
                };
            } else {
                throw new Error(`首页跳转失败: ${homeResult.error}`);
            }

        } catch (error) {
            console.error(`❌ 点击首页失败: ${error.message}`);

            // 尝试备用方案：直接导航到首页
            console.log('🔄 尝试备用方案：直接导航到首页...');
            try {
                await this.page.goto('https://bibigpt.co/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });

                const title = await this.page.title();
                const url = this.page.url();

                console.log('✅ 备用方案成功');
                console.log(`📍 页面标题: ${title}`);
                console.log(`🔗 页面URL: ${url}`);

                return {
                    success: true,
                    title: title,
                    url: url,
                    method: 'direct_navigation'
                };

            } catch (navError) {
                console.error(`❌ 备用方案也失败: ${navError.message}`);
                return {
                    success: false,
                    error: `点击首页和直接导航都失败: ${error.message}, ${navError.message}`
                };
            }
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
            
            // 2. 导航到页面
            await this.navigateToPage();
            
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

            // 5. 点击首页按钮
            const homeResult = await this.clickHomePage();

            console.log('');
            console.log('🎉 自动化流程完成！');

            return {
                success: true,
                register: registerResult,
                homepage: homeResult
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
            // 保持浏览器打开10秒让用户查看结果
            console.log('');
            console.log('浏览器将在10秒后关闭...');
            if (this.page) {
                await this.page.waitForTimeout(10000);
            }
            
            await this.cleanup();
        }
    }
}

// 🚀 主程序入口
async function main() {
    const automation = new BibiGPTAutomation();
    const result = await automation.run();
    
    if (result.success) {
        console.log('🎉 程序执行成功！');
        process.exit(0);
    } else {
        console.log('❌ 程序执行失败！');
        process.exit(1);
    }
}

// 运行主程序
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { BibiGPTAutomation };
