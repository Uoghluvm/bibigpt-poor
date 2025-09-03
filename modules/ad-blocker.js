// 🛡️ 广告拦截模块
class AdBlocker {
    constructor() {
        this.isActive = false;
        this.blockedCount = 0;
    }

    /**
     * 设置CSS注入广告拦截
     * @param {Page} page - Playwright页面对象
     */
    async setupCSSBlocking(page) {
        console.log('🛡️ 设置CSS广告拦截...');
        
        await page.addStyleTag({
            content: `
                /* 隐藏广告弹窗 */
                div[role="dialog"][data-state="open"]:has(h2:contains("返校季")),
                div[role="dialog"][data-state="open"]:has(h2:contains("欢迎加入")),
                div[role="dialog"][data-state="open"]:has(h2:contains("特惠")),
                div[role="dialog"][data-state="open"]:has(h2:contains("优惠")),
                div[role="dialog"][data-state="open"]:has(h2:contains("限时")) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                /* 隐藏弹窗背景遮罩 */
                div[data-radix-portal] div[data-state="open"][data-slot="dialog-overlay"] {
                    display: none !important;
                    pointer-events: none !important;
                }

                /* 隐藏引导遮罩层 (Driver Overlay) */
                .driver-overlay,
                .driver-overlay-animated,
                svg.driver-overlay,
                svg.driver-overlay-animated,
                svg[class*="driver-overlay"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    z-index: -1 !important;
                }

                /* 隐藏常见广告容器 */
                .ad-container,
                .advertisement,
                .ads-banner,
                [class*="ad-"],
                [id*="ad-"],
                [class*="ads-"],
                [id*="ads-"] {
                    display: none !important;
                }
            `
        });
        
        console.log('✅ CSS广告拦截已设置');
    }

    /**
     * 设置模态弹窗监听和ESC拦截
     * @param {Page} page - Playwright页面对象
     */
    async setupModalDialogBlocking(page) {
        console.log('🔍 设置模态弹窗监听和ESC拦截...');

        await page.evaluate(() => {
            let blockedCount = 0;

            // 检测模态弹窗和遮罩层的函数
            const isModalDialog = (element) => {
                // 检查是否是模态弹窗
                const hasDialogRole = element.getAttribute('role') === 'dialog';
                const hasDataState = element.getAttribute('data-state') === 'open';
                const hasModalClass = element.className && (
                    element.className.includes('modal') ||
                    element.className.includes('dialog') ||
                    element.className.includes('overlay') ||
                    element.className.includes('backdrop')
                );

                // 检查是否是引导遮罩层（driver overlay）
                const isDriverOverlay = element.className && (
                    element.className.includes('driver-overlay') ||
                    element.className.includes('driver-overlay-animated')
                );

                // 检查是否是SVG遮罩层
                const isSVGOverlay = element.tagName === 'svg' && (
                    element.className.baseVal?.includes('driver-overlay') ||
                    element.getAttribute('class')?.includes('driver-overlay')
                );

                // 检查样式特征
                const style = window.getComputedStyle(element);
                const isFixed = style.position === 'fixed';
                const hasHighZIndex = parseInt(style.zIndex) >= 1000; // 降低阈值以捕获更多遮罩
                const coversScreen = element.getBoundingClientRect().width > window.innerWidth * 0.5;

                return hasDialogRole || hasDataState || hasModalClass || isDriverOverlay || isSVGOverlay || (isFixed && hasHighZIndex && coversScreen);
            };

            // 自动按ESC关闭模态弹窗的函数
            const autoCloseModal = (element) => {
                console.log('🎯 检测到模态弹窗，自动按ESC关闭');

                // 方法1: 直接按ESC键
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Escape',
                    code: 'Escape',
                    keyCode: 27,
                    bubbles: true,
                    cancelable: true
                }));

                // 方法2: 查找并点击关闭按钮
                setTimeout(() => {
                    const closeButtons = element.querySelectorAll('button[aria-label*="close" i], button[title*="close" i], button:has(svg), [data-dismiss]');
                    closeButtons.forEach(btn => {
                        if (btn.offsetParent !== null) { // 检查是否可见
                            btn.click();
                        }
                    });
                }, 100);

                // 方法3: 直接隐藏元素
                setTimeout(() => {
                    if (element.offsetParent !== null) { // 如果还可见
                        element.style.display = 'none !important';
                        element.style.visibility = 'hidden !important';
                        element.style.opacity = '0 !important';
                        element.style.pointerEvents = 'none !important';
                    }
                }, 500);

                blockedCount++;
            };

            // DOM变化监听器
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // 检查新添加的元素是否是模态弹窗或遮罩层
                            if (isModalDialog(node)) {
                                autoCloseModal(node);
                            }

                            // 检查子元素中的模态弹窗和遮罩层
                            if (node.querySelectorAll) {
                                const modalElements = node.querySelectorAll('div[role="dialog"], div[data-state="open"], .modal, .dialog, .driver-overlay, svg.driver-overlay');
                                modalElements.forEach(modal => {
                                    if (isModalDialog(modal)) {
                                        autoCloseModal(modal);
                                    }
                                });
                            }
                        }
                    });

                    // 监听属性变化（如data-state从closed变为open）
                    if (mutation.type === 'attributes') {
                        const element = mutation.target;
                        if (isModalDialog(element)) {
                            autoCloseModal(element);
                        }
                    }
                });
            });

            // 开始监听
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-state', 'role', 'class', 'style']
            });

            // 定期检查现有的模态弹窗和遮罩层
            const checkExistingModals = () => {
                const existingModals = document.querySelectorAll('div[role="dialog"], div[data-state="open"], .modal, .dialog, .driver-overlay, svg.driver-overlay, svg[class*="driver-overlay"]');
                existingModals.forEach(modal => {
                    if (isModalDialog(modal) && modal.offsetParent !== null) {
                        console.log('🎯 定期检查发现遮罩层:', modal.tagName, modal.className);
                        autoCloseModal(modal);
                    }
                });
            };

            // 立即检查一次
            checkExistingModals();

            // 每2秒检查一次
            setInterval(checkExistingModals, 2000);

            window.adBlockerObserver = observer;
            window.adBlockerCount = blockedCount;
        });

        console.log('✅ 模态弹窗监听和ESC拦截已启动');
    }

    /**
     * 手动关闭当前页面的广告
     * @param {Page} page - Playwright页面对象
     */
    async closeCurrentAds(page) {
        console.log('🔧 手动关闭当前广告...');
        
        // 多次按ESC键
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
        }
        
        // 查找并点击关闭按钮
        const closeSelectors = [
            'div[role="dialog"] button:has(svg.lucide-x)',
            'div[role="dialog"] button:has(span.sr-only:has-text("Close"))',
            'div[data-state="open"] button:has(svg.lucide-x)',
            'button[class*="absolute"][class*="right"][class*="top"]:has(svg)',
            'button[aria-label*="close" i]',
            'button[title*="close" i]'
        ];
        
        for (const selector of closeSelectors) {
            try {
                const elements = await page.locator(selector).all();
                for (const element of elements) {
                    if (await element.isVisible()) {
                        await element.click();
                        console.log(`✅ 点击关闭按钮: ${selector}`);
                        await page.waitForTimeout(500);
                        break;
                    }
                }
            } catch (error) {
                // 继续尝试下一个选择器
            }
        }
        
        console.log('✅ 当前广告关闭完成');
    }

    /**
     * 启动完整的广告拦截系统
     * @param {Page} page - Playwright页面对象
     */
    async startBlocking(page) {
        if (this.isActive) return;
        
        console.log('🚀 启动完整广告拦截系统...');
        
        // 1. CSS注入拦截
        await this.setupCSSBlocking(page);

        // 2. 模态弹窗监听拦截
        await this.setupModalDialogBlocking(page);

        // 3. 关闭当前广告
        await this.closeCurrentAds(page);
        
        this.isActive = true;
        console.log('✅ 广告拦截系统已启动');
    }

    /**
     * 停止广告拦截系统
     * @param {Page} page - Playwright页面对象
     */
    async stopBlocking(page) {
        if (!this.isActive) return;
        
        await page.evaluate(() => {
            if (window.adBlockerObserver) {
                window.adBlockerObserver.disconnect();
                delete window.adBlockerObserver;
            }
        });
        
        this.isActive = false;
        console.log('🛑 广告拦截系统已停止');
    }

    /**
     * 获取拦截统计
     * @param {Page} page - Playwright页面对象
     * @returns {number} 拦截数量
     */
    async getBlockedCount(page) {
        const count = await page.evaluate(() => {
            return window.adBlockerCount || 0;
        });
        
        return count;
    }

    /**
     * 强制清理所有广告元素
     * @param {Page} page - Playwright页面对象
     */
    async forceCleanAds(page) {
        console.log('💪 强制清理所有广告元素...');
        
        await page.evaluate(() => {
            // 强制移除所有可能的广告元素
            const adSelectors = [
                'div[role="dialog"]',
                'div[data-state="open"]',
                'div[data-slot="dialog-overlay"]',
                'div[class*="overlay"]',
                'div[class*="backdrop"]',
                'div[class*="z-50"]',
                '.ad-container',
                '.advertisement',
                '[class*="ad-"]',
                '[id*="ad-"]'
            ];
            
            let removedCount = 0;
            
            adSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        const text = element.textContent || '';
                        if (/特惠|优惠|限时|返校季|欢迎加入|立即购买|抢购/.test(text) || 
                            element.getAttribute('data-state') === 'open') {
                            element.remove();
                            removedCount++;
                        }
                    });
                } catch (error) {
                    console.log(`清理选择器失败: ${selector}`);
                }
            });
            
            console.log(`强制清理了 ${removedCount} 个广告元素`);
            return removedCount;
        });
        
        console.log('✅ 强制清理完成');
    }
}

module.exports = { AdBlocker };
