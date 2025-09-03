// 📝 表单填写模块
class FormFiller {
    constructor() {
        this.filledFields = [];
    }

    /**
     * 智能查找邮箱输入框
     * @param {Page} page - Playwright页面对象
     * @returns {Locator} 邮箱输入框定位器
     */
    async findEmailInput(page) {
        const emailSelectors = [
            'input[type="email"]',
            'input[name*="email" i]',
            'input[placeholder*="email" i]',
            'input[id*="email" i]',
            'input[name*="邮箱"]',
            'input[placeholder*="邮箱"]',
            'input[autocomplete="email"]'
        ];

        for (const selector of emailSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`✅ 找到邮箱输入框: ${selector}`);
                    return element;
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('❌ 未找到邮箱输入框');
    }

    /**
     * 智能查找密码输入框
     * @param {Page} page - Playwright页面对象
     * @returns {Locator} 密码输入框定位器
     */
    async findPasswordInput(page) {
        const passwordSelectors = [
            'input[type="password"]',
            'input[name*="password" i]',
            'input[placeholder*="password" i]',
            'input[id*="password" i]',
            'input[name*="密码"]',
            'input[placeholder*="密码"]',
            'input[autocomplete="current-password"]',
            'input[autocomplete="new-password"]'
        ];

        for (const selector of passwordSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`✅ 找到密码输入框: ${selector}`);
                    return element;
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('❌ 未找到密码输入框');
    }

    /**
     * 智能查找提交按钮
     * @param {Page} page - Playwright页面对象
     * @returns {Locator} 提交按钮定位器
     */
    async findSubmitButton(page) {
        const submitSelectors = [
            // BibiGPT特定选择器
            'button[type="submit"].supabase-auth-ui_ui-button:has-text("注册")',
            'button[class*="supabase-auth-ui_ui-button"]:has-text("注册")',
            
            // 通用提交按钮选择器
            'button[type="submit"]:has-text("注册")',
            'button[type="submit"]:has-text("sign up")',
            'button[type="submit"]:has-text("Sign Up")',
            'button:has-text("注册")',
            'button:has-text("sign up")',
            'button:has-text("Sign Up")',
            'button:has-text("登录")',
            'button:has-text("login")',
            'button:has-text("Login")',
            
            // 输入框提交
            'input[type="submit"][value*="注册"]',
            'input[type="submit"][value*="sign"]',
            'input[type="submit"][value*="Sign"]',
            'input[type="submit"][value*="登录"]',
            'input[type="submit"][value*="login"]',
            
            // 通用提交按钮
            'button[type="submit"]',
            'input[type="submit"]'
        ];

        for (const selector of submitSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`✅ 找到提交按钮: ${selector}`);
                    return element;
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('❌ 未找到提交按钮');
    }

    /**
     * 填写邮箱
     * @param {Page} page - Playwright页面对象
     * @param {string} email - 邮箱地址
     */
    async fillEmail(page, email) {
        console.log('📧 填写邮箱地址...');
        
        try {
            const emailInput = await this.findEmailInput(page);
            
            // 清空现有内容
            await emailInput.clear();
            await page.waitForTimeout(300);
            
            // 填写邮箱
            await emailInput.fill(email);
            await page.waitForTimeout(500);
            
            // 验证填写结果
            const value = await emailInput.inputValue();
            if (value === email) {
                console.log(`✅ 邮箱填写成功: ${email}`);
                this.filledFields.push({ type: 'email', value: email, success: true });
            } else {
                throw new Error(`邮箱填写验证失败: 期望 ${email}, 实际 ${value}`);
            }
        } catch (error) {
            console.error(`❌ 邮箱填写失败: ${error.message}`);
            this.filledFields.push({ type: 'email', value: email, success: false, error: error.message });
            throw error;
        }
    }

    /**
     * 填写密码
     * @param {Page} page - Playwright页面对象
     * @param {string} password - 密码
     */
    async fillPassword(page, password) {
        console.log('🔒 填写密码...');
        
        try {
            const passwordInput = await this.findPasswordInput(page);
            
            // 清空现有内容
            await passwordInput.clear();
            await page.waitForTimeout(300);
            
            // 填写密码
            await passwordInput.fill(password);
            await page.waitForTimeout(500);
            
            // 验证填写结果（密码框通常不能读取值，所以只检查是否有内容）
            const value = await passwordInput.inputValue();
            if (value.length > 0) {
                console.log(`✅ 密码填写成功`);
                this.filledFields.push({ type: 'password', success: true });
            } else {
                throw new Error('密码填写验证失败: 密码框为空');
            }
        } catch (error) {
            console.error(`❌ 密码填写失败: ${error.message}`);
            this.filledFields.push({ type: 'password', success: false, error: error.message });
            throw error;
        }
    }

    /**
     * 点击提交按钮
     * @param {Page} page - Playwright页面对象
     * @param {Object} options - 点击选项
     */
    async clickSubmit(page, options = {}) {
        console.log('🚀 点击提交按钮...');
        
        const { force = false, timeout = 30000 } = options;
        
        try {
            const submitButton = await this.findSubmitButton(page);
            
            // 等待按钮可点击
            await submitButton.waitFor({ state: 'visible', timeout });
            
            // 点击按钮
            if (force) {
                await submitButton.click({ force: true });
                console.log('✅ 强制点击提交按钮成功');
            } else {
                await submitButton.click();
                console.log('✅ 点击提交按钮成功');
            }
            
            this.filledFields.push({ type: 'submit', success: true });
            
        } catch (error) {
            console.error(`❌ 点击提交按钮失败: ${error.message}`);
            this.filledFields.push({ type: 'submit', success: false, error: error.message });
            throw error;
        }
    }

    /**
     * 完整的表单填写流程
     * @param {Page} page - Playwright页面对象
     * @param {Object} formData - 表单数据
     * @param {Object} options - 选项
     */
    async fillForm(page, formData, options = {}) {
        console.log('📝 开始填写表单...');
        
        const { email, password } = formData;
        const { forceSubmit = false, waitBetweenSteps = 1000 } = options;
        
        this.filledFields = []; // 重置填写记录
        
        try {
            // 1. 填写邮箱
            if (email) {
                await this.fillEmail(page, email);
                await page.waitForTimeout(waitBetweenSteps);
            }
            
            // 2. 填写密码
            if (password) {
                await this.fillPassword(page, password);
                await page.waitForTimeout(waitBetweenSteps);
            }
            
            // 3. 点击提交
            await this.clickSubmit(page, { force: forceSubmit });
            
            console.log('✅ 表单填写完成');
            return {
                success: true,
                filledFields: this.filledFields
            };
            
        } catch (error) {
            console.error(`❌ 表单填写失败: ${error.message}`);
            return {
                success: false,
                error: error.message,
                filledFields: this.filledFields
            };
        }
    }

    /**
     * 获取填写记录
     * @returns {Array} 填写记录数组
     */
    getFilledFields() {
        return this.filledFields;
    }

    /**
     * 重置填写记录
     */
    resetFilledFields() {
        this.filledFields = [];
    }

    /**
     * 智能查找首页按钮
     * @param {Page} page - Playwright页面对象
     * @returns {Locator} 首页按钮定位器
     */
    async findHomeButton(page) {
        const homeSelectors = [
            // 文本选择器
            'button:has-text("首页")',
            'a:has-text("首页")',
            'button:has-text("Home")',
            'a:has-text("Home")',
            'button:has-text("主页")',
            'a:has-text("主页")',

            // 导航相关选择器
            'nav button:has-text("首页")',
            'nav a:has-text("首页")',
            '.nav button:has-text("首页")',
            '.nav a:has-text("首页")',
            '.navbar button:has-text("首页")',
            '.navbar a:has-text("首页")',

            // 通用导航选择器
            '[href="/"]',
            '[href="/home"]',
            '[href="/index"]',
            'a[class*="home"]',
            'button[class*="home"]',

            // ID和类名选择器
            '#home',
            '#homepage',
            '.home-button',
            '.home-link',

            // 图标相关选择器
            'button:has(svg):has-text("首页")',
            'a:has(svg):has-text("首页")',
            'button[aria-label*="首页"]',
            'a[aria-label*="首页"]',
            'button[title*="首页"]',
            'a[title*="首页"]'
        ];

        for (const selector of homeSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`✅ 找到首页按钮: ${selector}`);
                    return element;
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('❌ 未找到首页按钮');
    }

    /**
     * 点击首页按钮
     * @param {Page} page - Playwright页面对象
     * @param {Object} options - 点击选项
     */
    async clickHomeButton(page, options = {}) {
        console.log('🏠 点击首页按钮...');

        const { force = false, timeout = 30000, waitAfterClick = 2000 } = options;

        try {
            const homeButton = await this.findHomeButton(page);

            // 等待按钮可点击
            await homeButton.waitFor({ state: 'visible', timeout });

            // 点击按钮
            if (force) {
                await homeButton.click({ force: true });
                console.log('✅ 强制点击首页按钮成功');
            } else {
                await homeButton.click();
                console.log('✅ 点击首页按钮成功');
            }

            // 等待页面跳转
            if (waitAfterClick > 0) {
                await page.waitForTimeout(waitAfterClick);
            }

            // 获取当前页面信息
            const currentUrl = page.url();
            const currentTitle = await page.title();
            console.log(`📍 当前页面: ${currentTitle}`);
            console.log(`🔗 当前URL: ${currentUrl}`);

            this.filledFields.push({
                type: 'home_navigation',
                success: true,
                url: currentUrl,
                title: currentTitle
            });

            return {
                success: true,
                url: currentUrl,
                title: currentTitle
            };

        } catch (error) {
            console.error(`❌ 点击首页按钮失败: ${error.message}`);
            this.filledFields.push({
                type: 'home_navigation',
                success: false,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 检查表单是否存在
     * @param {Page} page - Playwright页面对象
     * @returns {Object} 表单检查结果
     */
    async checkFormExists(page) {
        const result = {
            hasEmailInput: false,
            hasPasswordInput: false,
            hasSubmitButton: false,
            hasHomeButton: false
        };

        try {
            await this.findEmailInput(page);
            result.hasEmailInput = true;
        } catch (error) {
            // 邮箱输入框不存在
        }

        try {
            await this.findPasswordInput(page);
            result.hasPasswordInput = true;
        } catch (error) {
            // 密码输入框不存在
        }

        try {
            await this.findSubmitButton(page);
            result.hasSubmitButton = true;
        } catch (error) {
            // 提交按钮不存在
        }

        try {
            await this.findHomeButton(page);
            result.hasHomeButton = true;
        } catch (error) {
            // 首页按钮不存在
        }

        result.isComplete = result.hasEmailInput && result.hasPasswordInput && result.hasSubmitButton;

        console.log('📋 页面元素检查结果:', result);
        return result;
    }
}

module.exports = { FormFiller };
