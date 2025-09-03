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

        // 循环处理状态
        this.currentRow = 1; // 从第二行开始（索引1，第一个视频）
        this.maxRows = 0;
        
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
     * 简单按ESC关闭弹窗
     */
    async pressEscapeToClosePopups() {
        console.log('⌨️ 按ESC关闭可能的弹窗...');

        // 连续按3次ESC，确保关闭各种弹窗
        for (let i = 0; i < 3; i++) {
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
        }

        console.log('✅ ESC按键完成');
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

            // 等待页面跳转到content页面，同时监听余额不足
            let contentPageReached = false;
            let attempts = 0;
            const maxAttempts = 30; // 最多等待30次，每次2秒

            while (!contentPageReached && attempts < maxAttempts) {
                const currentUrl = this.page.url();
                console.log(`🔗 当前URL: ${currentUrl}`);

                // 在等待过程中检查余额不足和Failed to fetch错误
                const errorCheck = await this.checkDesktopErrors();
                if (errorCheck.hasPaymentRequired) {
                    console.log('💳 在等待跳转时检测到余额不足');
                    throw new Error('PAYMENT_REQUIRED');
                }
                if (errorCheck.hasFailedToFetch) {
                    console.log('❌ 在等待跳转时检测到Failed to fetch');
                    throw new Error('FAILED_TO_FETCH');
                }

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

            // 检查是否出现余额不足提示
            const paymentRequired = await this.checkPaymentRequired();
            if (paymentRequired) {
                console.log('💳 检测到余额不足，需要重新注册账号');
                throw new Error('PAYMENT_REQUIRED');
            }

            // 按ESC关闭遮罩层
            console.log('⌨️ 按ESC关闭遮罩层...');
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(3000);
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(1000);

            // 等待内容稳定
            console.log('⏰ 等待内容稳定...');
            await this.page.waitForTimeout(5000); // 增加到5秒

            // 点击下拉按钮
            await this.clickDropdownButton();

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
     * 开始视频循环处理（包含第一轮）
     */
    async startVideoLoop() {
        console.log('');
        console.log('🔄 ==========================================');
        console.log('🔄 第二阶段：循环处理所有视频');
        console.log('🔄 ==========================================');

        try {
            // 读取CSV文件
            console.log('📊 读取CSV文件...');
            const fs = require('fs');
            if (!fs.existsSync(this.config.csvFilePath)) {
                console.log('⚠️ CSV文件不存在，创建示例文件...');
                this.csvReader.createSampleCSV(this.config.csvFilePath);
            }

            this.csvReader.readCSV(this.config.csvFilePath);
            const csvData = this.csvReader.getAllData();
            this.maxRows = csvData.length;

            console.log(`📊 CSV总行数: ${this.maxRows}`);
            console.log(`🎯 开始处理，从第 ${this.currentRow + 1} 行开始`);

            const processedVideos = [];

            // 循环处理所有视频
            while (this.currentRow < this.maxRows) {
                console.log('');
                console.log(`🎬 ==========================================`);
                console.log(`🎬 处理第 ${this.currentRow + 1} 行视频`);
                console.log(`🎬 ==========================================`);

                const videoResult = await this.processVideoRound();
                processedVideos.push(videoResult);

                if (!videoResult.success) {
                    // 检查是否是余额不足错误
                    if (videoResult.error === 'PAYMENT_REQUIRED') {
                        console.log('💳 余额不足，重新注册新账号...');

                        // 重新注册账号（全新浏览器）
                        const reRegisterResult = await this.reRegisterAccount();

                        if (reRegisterResult.success) {
                            console.log('✅ 重新注册成功，重试当前视频');

                            // 重试当前视频
                            const retryResult = await this.retryCurrentVideo();
                            processedVideos.push(retryResult);

                            if (retryResult.success) {
                                console.log('✅ 重试成功');
                            } else {
                                console.log('❌ 重试失败，跳过当前视频');
                            }
                        } else {
                            console.log('❌ 重新注册失败，跳过当前视频');
                        }
                    } else if (videoResult.error === 'FAILED_TO_FETCH') {
                        console.log('❌ Failed to fetch错误，添加备注并跳到下一行');

                        // 在CSV第三列添加备注
                        this.csvReader.addNoteToCSV(this.currentRow, 'Failed to fetch', this.config.csvFilePath);

                        // 跳到下一行继续处理
                        console.log('⏭️ 跳过当前视频，继续处理下一个');
                    } else {
                        console.log(`⚠️ 第 ${this.currentRow + 1} 行处理失败，继续下一个`);
                    }
                }

                this.currentRow++;

                console.log(`✅ 第 ${this.currentRow} 行处理完成`);

                // 如果不是最后一个视频，稍作等待
                if (this.currentRow < this.maxRows) {
                    console.log('⏰ 等待2秒后处理下一个视频...');
                    await this.page.waitForTimeout(2000);
                }
            }

            console.log('🎉 所有视频处理完成！');

            return {
                success: true,
                totalProcessed: processedVideos.length,
                processedVideos: processedVideos
            };

        } catch (error) {
            console.error(`❌ 视频循环处理失败: ${error.message}`);

            return {
                success: false,
                error: error.message,
                processedCount: this.currentRow - 1
            };
        }
    }

    /**
     * 处理一轮完整的视频操作
     */
    async processVideoRound() {
        try {
            // 1. 导航到桌面版页面
            console.log('🌐 导航到BibiGPT桌面版页面...');
            await this.navigateToDesktopPage();

            // 按ESC关闭可能的弹窗
            await this.pressEscapeToClosePopups();

            // 2. 读取当前行的视频链接
            const videoLink = this.csvReader.getCell(this.currentRow, 0);
            console.log(`🔗 获取视频链接: ${videoLink}`);

            // 验证链接格式
            if (!this.csvReader.validateLink(videoLink)) {
                throw new Error(`无效的链接格式: ${videoLink}`);
            }

            // 3. 输入视频链接并提交
            console.log('📝 输入视频链接到页面...');
            const inputResult = await this.formFiller.inputVideoLink(this.page, videoLink, {
                clearFirst: true,
                pressEnter: true,
                waitAfterInput: 1000
            });

            if (!inputResult.success) {
                throw new Error(`视频链接输入失败: ${inputResult.error}`);
            }

            // 4. 监控content页面并保存
            const contentResult = await this.monitorContentPage();

            if (!contentResult.success) {
                // 传递特殊错误类型
                if (contentResult.error === 'PAYMENT_REQUIRED') {
                    throw new Error('PAYMENT_REQUIRED');
                } else if (contentResult.error === 'FAILED_TO_FETCH') {
                    throw new Error('FAILED_TO_FETCH');
                } else {
                    throw new Error(`content页面监控失败: ${contentResult.error}`);
                }
            }

            // 下一轮将直接访问desktop页面，无需额外操作

            return {
                success: true,
                row: this.currentRow + 1,
                link: videoLink,
                inputResult: inputResult,
                contentResult: contentResult
            };

        } catch (error) {
            console.error(`❌ 处理视频轮次失败: ${error.message}`);

            return {
                success: false,
                row: this.currentRow + 1,
                error: error.message
            };
        }
    }



    /**
     * 重试当前视频
     */
    async retryCurrentVideo() {
        try {
            console.log('');
            console.log('🔄 ==========================================');
            console.log(`🔄 重试第 ${this.currentRow + 1} 行视频`);
            console.log('🔄 ==========================================');

            // 获取当前行的视频链接
            const videoLink = this.csvReader.getCell(this.currentRow, 0);
            console.log(`🔗 重试视频链接: ${videoLink}`);

            // 1. 导航到桌面版页面
            console.log('🌐 导航到BibiGPT桌面版页面...');
            await this.navigateToDesktopPage();

            // 按ESC关闭可能的弹窗
            await this.pressEscapeToClosePopups();

            // 2. 验证链接格式
            if (!this.csvReader.validateLink(videoLink)) {
                throw new Error(`无效的链接格式: ${videoLink}`);
            }

            // 3. 输入视频链接并提交
            console.log('📝 输入视频链接到页面...');
            const inputResult = await this.formFiller.inputVideoLink(this.page, videoLink, {
                clearFirst: true,
                pressEnter: true,
                waitAfterInput: 1000
            });

            if (!inputResult.success) {
                throw new Error(`视频链接输入失败: ${inputResult.error}`);
            }

            // 4. 监控content页面并保存
            const contentResult = await this.monitorContentPage();

            if (!contentResult.success) {
                // 如果还是余额不足，返回失败
                if (contentResult.error === 'PAYMENT_REQUIRED') {
                    throw new Error('PAYMENT_REQUIRED');
                } else {
                    throw new Error(`content页面监控失败: ${contentResult.error}`);
                }
            }

            return {
                success: true,
                row: this.currentRow + 1,
                link: videoLink,
                inputResult: inputResult,
                contentResult: contentResult,
                isRetry: true
            };

        } catch (error) {
            console.error(`❌ 重试视频失败: ${error.message}`);

            return {
                success: false,
                row: this.currentRow + 1,
                error: error.message,
                isRetry: true
            };
        }
    }

    /**
     * 重新注册账号 - 使用全新浏览器
     */
    async reRegisterAccount() {
        try {
            console.log('');
            console.log('🔄 ==========================================');
            console.log('🔄 重新注册新账号（全新浏览器）');
            console.log('🔄 ==========================================');

            // 1. 关闭当前浏览器
            console.log('🔄 关闭当前浏览器...');
            if (this.browser) {
                await this.browser.close();
            }

            // 2. 重新初始化全新浏览器
            console.log('🌐 启动全新浏览器...');
            await this.initBrowser();

            // 3. 导航到注册页面
            console.log('🌐 导航到注册页面...');
            await this.navigateToRegisterPage();

            // 4. 按ESC关闭弹窗
            await this.pressEscapeToClosePopups();

            // 5. 自动注册新账号
            console.log('📝 开始注册新账号...');
            const registerResult = await this.autoRegister();

            if (registerResult.success) {
                console.log('✅ 新账号注册成功');
                console.log(`📧 新邮箱: ${registerResult.email}`);

                // 等待注册后页面稳定
                await this.page.waitForTimeout(3000);

                return {
                    success: true,
                    email: registerResult.email
                };
            } else {
                throw new Error(`新账号注册失败: ${registerResult.error}`);
            }

        } catch (error) {
            console.error(`❌ 重新注册账号失败: ${error.message}`);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 检查desktop页面的各种错误
     */
    async checkDesktopErrors() {
        try {
            // 获取页面内容
            const pageContent = await this.page.textContent('body');

            const result = {
                hasPaymentRequired: false,
                hasFailedToFetch: false
            };

            if (pageContent) {
                // 检测余额不足
                const paymentTexts = [
                    "余额不足啦",
                    "请升级会员或购买时长哦"
                ];

                for (const text of paymentTexts) {
                    if (pageContent.includes(text)) {
                        console.log(`💳 检测到余额不足文本: "${text}"`);
                        result.hasPaymentRequired = true;
                        break;
                    }
                }

                // 检测Failed to fetch错误
                const fetchErrorTexts = [
                    "Failed to fetch",
                    "fetch failed",
                    "网络请求失败",
                    "请求失败"
                ];

                for (const text of fetchErrorTexts) {
                    if (pageContent.includes(text)) {
                        console.log(`❌ 检测到Failed to fetch错误: "${text}"`);
                        result.hasFailedToFetch = true;
                        break;
                    }
                }
            }

            return result;

        } catch (error) {
            console.log(`⚠️ 检查desktop页面错误时出错: ${error.message}`);
            return {
                hasPaymentRequired: false,
                hasFailedToFetch: false
            };
        }
    }

    /**
     * 检查是否出现余额不足提示
     */
    async checkPaymentRequired() {
        try {
            console.log('💳 检查是否出现余额不足提示...');

            // 检查页面中是否包含余额不足的文本
            const paymentRequiredSelectors = [
                // 检查页面标题
                'h1:has-text("Payment Required")',
                'h2:has-text("Payment Required")',
                'h3:has-text("Payment Required")',

                // 检查包含余额不足文本的元素
                'text="Payment Required"',
                'text="余额不足"',
                'text="请升级会员"',
                'text="购买时长"',

                // 检查包含相关文本的任何元素
                '*:has-text("Payment Required")',
                '*:has-text("余额不足啦")',
                '*:has-text("请升级会员或购买时长哦")',

                // 检查错误提示容器
                'div[class*="error"]:has-text("Payment")',
                'div[class*="alert"]:has-text("余额")',
                'div[class*="warning"]:has-text("会员")'
            ];

            for (const selector of paymentRequiredSelectors) {
                try {
                    const element = this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`💳 检测到余额不足提示: ${selector}`);
                        return true;
                    }
                } catch (error) {
                    continue;
                }
            }

            // 检查页面内容是否包含相关文本
            const pageContent = await this.page.textContent('body');
            const paymentKeywords = [
                'Payment Required',
                '余额不足',
                '请升级会员',
                '购买时长',
                '会员已过期',
                '账户余额不足'
            ];

            for (const keyword of paymentKeywords) {
                if (pageContent && pageContent.includes(keyword)) {
                    console.log(`💳 页面内容包含余额不足关键词: ${keyword}`);
                    return true;
                }
            }

            console.log('✅ 未检测到余额不足提示');
            return false;

        } catch (error) {
            console.log(`⚠️ 检查余额状态时出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 点击处理队列中的下拉按钮
     */
    async clickDropdownButton() {
        try {
            console.log('🔽 点击处理队列下拉按钮...');

            // 基于提供的完整HTML结构创建精确选择器
            const dropdownSelectors = [
                // 最精确的选择器 - 基于完整的HTML结构
                'div[data-slot="card-header"] button.size-7:has(svg.lucide-chevron-down)',
                'div[data-slot="card-header"] button[class*="size-7"][class*="p-0"]:has(svg.lucide-chevron-down)',

                // 基于处理队列容器的选择器
                'div:has(div[data-slot="card-title"]:has-text("处理队列")) button:has(svg.lucide-chevron-down)',
                'div:has(div:has-text("处理队列")) button.size-7:has(svg)',

                // 基于按钮特征的选择器
                'button.inline-flex.size-7.p-0:has(svg.lucide-chevron-down)',
                'button[class*="size-7"][class*="p-0"]:has(svg[class*="chevron-down"])',

                // 基于SVG路径的选择器
                'button:has(svg path[d="m6 9 6 6 6-6"])',
                'button.size-7:has(svg path[d="m6 9 6 6 6-6"])',

                // 基于容器层级的选择器
                'div.flex.items-center.gap-1 button:last-child:has(svg.lucide-chevron-down)',
                'div.flex.items-center.justify-between div.flex.items-center.gap-1 button:last-child',

                // 通用备选选择器
                'button.size-7:has(svg.lucide-chevron-down)',
                'button[class*="p-0"]:has(svg.lucide-chevron-down)',
                'button:has(svg.lucide-chevron-down.size-4)'
            ];

            for (const selector of dropdownSelectors) {
                try {
                    const button = this.page.locator(selector).first();
                    if (await button.isVisible()) {
                        console.log(`✅ 找到处理队列下拉按钮，点击: ${selector}`);
                        await button.click();
                        await this.page.waitForTimeout(1000);
                        console.log('✅ 处理队列下拉按钮点击成功');
                        return;
                    }
                } catch (error) {
                    continue;
                }
            }

            console.log('⚠️ 未找到处理队列下拉按钮，继续执行...');

        } catch (error) {
            console.log(`⚠️ 点击处理队列下拉按钮时出错: ${error.message}`);
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

            // 3. 按ESC关闭弹窗
            await this.pressEscapeToClosePopups();

            // 4. 自动注册
            console.log('📝 第一阶段：自动注册');
            const registerResult = await this.autoRegister();

            if (!registerResult.success) {
                throw new Error(`自动注册失败: ${registerResult.error}`);
            }

            // 等待注册后页面稳定
            await this.page.waitForTimeout(3000);

            // 5. 开始视频循环处理（包含第一轮）
            const loopResult = await this.startVideoLoop();

            console.log('');
            console.log('🎉 自动化流程完成！');

            return {
                success: true,
                register: registerResult,
                loop: loopResult
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
