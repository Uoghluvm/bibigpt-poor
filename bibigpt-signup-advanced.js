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

// 🚀 高效广告拦截系统
async function setupAdvancedAdBlocker(page) {
    console.log('🛡️ 正在设置高效广告拦截系统...');
    
    // 方案1: CSS注入 - 从源头隐藏广告弹窗
    await page.addStyleTag({
        content: `
            /* 隐藏所有模态弹窗广告 */
            div[role="dialog"][data-state="open"]:has(h2:contains("返校季")),
            div[role="dialog"][data-state="open"]:has(h2:contains("欢迎加入")),
            div[role="dialog"][data-state="open"]:has(h2:contains("特惠")),
            div[role="dialog"][data-state="open"]:has(h2:contains("优惠")) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            /* 隐藏弹窗背景遮罩 */
            div[data-radix-portal] div[data-state="open"] {
                background: transparent !important;
            }
        `
    });
    
    // 方案2: DOM变化监听器 - 实时检测并关闭新弹窗
    await page.evaluate(() => {
        console.log('🔍 启动DOM变化监听器...');
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // 检测模态弹窗
                        if (node.matches && (
                            node.matches('div[role="dialog"]') ||
                            node.matches('div[data-state="open"]') ||
                            node.matches('div[id^="radix-"]')
                        )) {
                            console.log('🎯 检测到新弹窗，立即关闭...');
                            // 立即按ESC关闭
                            document.dispatchEvent(new KeyboardEvent('keydown', {
                                key: 'Escape',
                                code: 'Escape',
                                keyCode: 27,
                                bubbles: true
                            }));
                        }
                        
                        // 检查子元素中是否有弹窗
                        const dialogs = node.querySelectorAll && node.querySelectorAll('div[role="dialog"], div[data-state="open"], div[id^="radix-"]');
                        if (dialogs && dialogs.length > 0) {
                            console.log('🎯 在新添加的元素中检测到弹窗，立即关闭...');
                            document.dispatchEvent(new KeyboardEvent('keydown', {
                                key: 'Escape',
                                code: 'Escape',
                                keyCode: 27,
                                bubbles: true
                            }));
                        }
                    }
                });
            });
        });
        
        // 开始监听DOM变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 将observer保存到window对象，以便后续可以停止
        window.adBlockerObserver = observer;
    });
    
    console.log('✅ 高效广告拦截系统已启动！');
}

// 传统的广告关闭函数（作为备用）
async function closeAds(page) {
    console.log('🔧 执行备用广告关闭...');
    
    // 检查是否有弹窗存在
    const dialogExists = await page.locator('div[role="dialog"], div[data-state="open"], div[id^="radix-"]').first().isVisible().catch(() => false);
    
    if (dialogExists) {
        console.log('检测到弹窗，使用ESC键关闭...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // 再次检查
        const stillExists = await page.locator('div[role="dialog"], div[data-state="open"], div[id^="radix-"]').first().isVisible().catch(() => false);
        if (stillExists) {
            console.log('弹窗仍存在，再次尝试ESC...');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        }
    }
}

async function signUpToBibiGPT() {
    // 启动浏览器
    const browser = await chromium.launch({
        headless: false, // 设置为false以便看到浏览器操作
        slowMo: 500 // 减少延迟，提高效率
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
        console.log('页面已加载');
        
        // 🚀 立即设置高效广告拦截系统
        await setupAdvancedAdBlocker(page);
        
        // 等待页面完全加载
        await page.waitForTimeout(2000);
        
        // 备用广告关闭（以防万一）
        await closeAds(page);
        
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
        
        // 5. 查找并点击sign up按钮
        console.log('正在点击Sign Up按钮...');
        
        // 针对BibiGPT特定的注册按钮选择器
        const signUpButtonSelectors = [
            'button[type="submit"].supabase-auth-ui_ui-button:has-text("注册")',
            'button[class*="supabase-auth-ui_ui-button"]:has-text("注册")',
            'button[type="submit"]:has-text("注册")',
            'button:has-text("注册")'
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
            const fallbackButton = page.locator('button:has-text("注册"), button[type="submit"]').first();
            await fallbackButton.click();
        }
        
        console.log('注册操作已完成！');
        console.log(`使用的邮箱: ${randomEmail}`);
        console.log(`使用的密码: ${randomEmail}`);
        
        // 等待注册后的页面加载（高效拦截系统会自动处理广告）
        await page.waitForTimeout(3000);
        console.log('✅ 所有操作完成！高效拦截系统持续运行中...');
        
    } catch (error) {
        console.error('操作过程中出现错误:', error);
        
        // 截图保存错误状态
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('已保存错误截图: error-screenshot.png');
        
    } finally {
        // 保持浏览器打开30秒以便查看结果
        console.log('浏览器将在30秒后关闭...');
        await page.waitForTimeout(30000);
        
        // 停止监听器
        await page.evaluate(() => {
            if (window.adBlockerObserver) {
                window.adBlockerObserver.disconnect();
                console.log('🛑 广告拦截监听器已停止');
            }
        });
        
        await browser.close();
    }
}

// 运行脚本
signUpToBibiGPT().catch(console.error);
