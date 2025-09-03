const { chromium } = require('playwright');

// 生成随机邮箱的函数
function generateRandomEmail() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    // 生成10位随机字符
    for (let i = 0; i < 10; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${randomString}@gmail.com`;
}

// 关闭广告弹窗的函数
async function closeAds(page) {
    console.log('正在检查并关闭广告弹窗...');

    // 检查是否有弹窗存在
    const dialogExists = await page.locator('div[role="dialog"], div[data-state="open"], div[id^="radix-"]').first().isVisible().catch(() => false);

    if (dialogExists) {
        console.log('检测到弹窗，使用ESC键关闭...');
        // 直接使用ESC键关闭弹窗（最简单有效的方法）
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        // 检查是否还有弹窗
        const stillExists = await page.locator('div[role="dialog"], div[data-state="open"], div[id^="radix-"]').first().isVisible().catch(() => false);
        if (stillExists) {
            console.log('弹窗仍存在，再次尝试ESC...');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        }

        console.log('弹窗关闭完成');
        return;
    }

    // 备用方案：如果ESC不起作用，尝试点击关闭按钮
    const specificCloseSelectors = [
        // Radix UI 弹窗的关闭按钮
        'div[role="dialog"] button:has(svg.lucide-x)',
        'div[role="dialog"] button:has(span.sr-only:has-text("Close"))',
        'div[data-state="open"] button:has(svg.lucide-x)',
        'button[class*="absolute"][class*="right"][class*="top"]:has(svg)',

        // 通用关闭按钮
        'button[aria-label*="close" i]',
        'button[title*="close" i]'
    ];

    // 备用方案：尝试点击关闭按钮
    console.log('尝试备用关闭方案...');
    for (const selector of specificCloseSelectors) {
        try {
            const elements = await page.locator(selector).all();
            for (const element of elements) {
                if (await element.isVisible()) {
                    console.log(`找到关闭按钮: ${selector}`);
                    await element.click();
                    await page.waitForTimeout(500);
                    return; // 成功关闭后退出
                }
            }
        } catch (error) {
            // 继续尝试下一个选择器
        }
    }

    console.log('未找到明显的关闭按钮，弹窗可能已通过ESC关闭');

    // 特殊处理：如果是欢迎弹窗（没有明显关闭按钮），尝试点击弹窗外部
    try {
        const welcomeDialog = await page.locator('h2:has-text("欢迎加入 BibiGPT")').first();
        if (await welcomeDialog.isVisible()) {
            console.log('检测到欢迎弹窗，尝试点击外部区域关闭...');
            // 点击页面左上角（通常是弹窗外部）
            await page.click('body', { position: { x: 10, y: 10 } });
            await page.waitForTimeout(500);

            // 如果还在，再次按ESC
            if (await welcomeDialog.isVisible()) {
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
            }
        }
    } catch (error) {
        // 忽略错误
    }
}

async function signUpToBibiGPT() {
    // 启动浏览器
    const browser = await chromium.launch({
        headless: false, // 设置为false以便看到浏览器操作
        slowMo: 1000 // 每个操作之间延迟1秒，便于观察
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('正在访问网站...');
        // 1. 访问网站
        await page.goto('https://bibigpt.co/r/bilibili', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        console.log('页面已加载，等待网络空闲...');

        // 等待页面加载
        try {
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('网络空闲状态达到');
        } catch (error) {
            console.log('网络空闲等待超时，继续执行...');
        }

        // 获取页面基本信息
        const title = await page.title();
        console.log(`页面标题: ${title}`);

        // 等待一下让页面完全加载
        await page.waitForTimeout(3000);
        console.log('开始关闭广告弹窗...');

        // 关闭可能出现的广告弹窗
        await closeAds(page);

        // 再次等待确保广告已关闭
        await page.waitForTimeout(1000);
        console.log('广告关闭完成，开始填写表单...');

        // 2. 生成随机邮箱
        const randomEmail = generateRandomEmail();
        console.log(`生成的随机邮箱: ${randomEmail}`);

        // 3. 查找并填写email address输入框
        console.log('正在填写邮箱地址...');
        const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[id*="email"]').first();
        await emailInput.fill(randomEmail);

        // 4. 查找并填写password输入框
        console.log('正在填写密码...');
        const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="password"], input[id*="password"]').first();
        await passwordInput.fill(randomEmail); // 使用相同的邮箱作为密码

        // 再次检查是否有新的广告弹窗
        await closeAds(page);

        // 5. 查找并点击sign up按钮
        console.log('正在点击Sign Up按钮...');

        // 针对BibiGPT特定的注册按钮选择器
        const signUpButtonSelectors = [
            // 基于提供的HTML结构的精确选择器
            'button[type="submit"].supabase-auth-ui_ui-button:has-text("注册")',
            'button[class*="supabase-auth-ui_ui-button"]:has-text("注册")',
            'button[class*="c-bOcPnF"]:has-text("注册")',
            'button[type="submit"]:has-text("注册")',

            // 通用的注册按钮选择器
            'button:has-text("注册")',
            'button:has-text("sign up")',
            'button:has-text("Sign Up")',
            'input[type="submit"][value*="注册"]',
            'input[type="submit"][value*="sign"]',
            'input[type="submit"][value*="Sign"]'
        ];

        let signUpButton = null;
        for (const selector of signUpButtonSelectors) {
            try {
                const button = page.locator(selector).first();
                if (await button.isVisible()) {
                    signUpButton = button;
                    console.log(`找到注册按钮: ${selector}`);
                    break;
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }

        if (signUpButton) {
            await signUpButton.click();
        } else {
            console.log('未找到注册按钮，尝试通用选择器...');
            // 备用方案
            const fallbackButton = page.locator('button:has-text("注册"), button[type="submit"]').first();
            await fallbackButton.click();
        }
        
        console.log('注册操作已完成！');
        console.log(`使用的邮箱: ${randomEmail}`);
        console.log(`使用的密码: ${randomEmail}`);

        // 等待注册后的页面加载
        await page.waitForTimeout(3000);

        // 关闭注册成功后可能出现的新广告弹窗
        console.log('检查注册后的广告弹窗...');
        await closeAds(page);

        // 再次等待确保所有弹窗都已关闭
        await page.waitForTimeout(2000);
        console.log('所有广告弹窗已处理完成！');
        
    } catch (error) {
        console.error('操作过程中出现错误:', error);
        
        // 如果找不到元素，尝试打印页面内容以便调试
        console.log('正在获取页面信息以便调试...');
        const title = await page.title();
        console.log(`页面标题: ${title}`);
        
        // 截图保存错误状态
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('已保存错误截图: error-screenshot.png');
        
    } finally {
        // 保持浏览器打开30秒以便查看结果
        console.log('浏览器将在30秒后关闭...');
        await page.waitForTimeout(30000);
        await browser.close();
    }
}

// 运行脚本
signUpToBibiGPT().catch(console.error);
