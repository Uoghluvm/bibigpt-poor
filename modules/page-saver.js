// 💾 网页保存模块
const fs = require('fs');
const path = require('path');

class PageSaver {
    constructor() {
        this.savedPages = [];
    }

    /**
     * 保存完整的网页内容
     * @param {Page} page - Playwright页面对象
     * @param {string} fileName - 保存的文件名（不含扩展名）
     * @returns {Object} 保存结果
     */
    async saveCompletePage(page, fileName = null) {
        try {
            console.log('💾 开始保存完整网页内容...');
            
            // 获取当前页面信息
            const currentUrl = page.url();
            const currentTitle = await page.title();
            
            // 生成文件名
            if (!fileName) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const urlPart = currentUrl.split('/').pop().substring(0, 20);
                fileName = `bibigpt-${urlPart}-${timestamp}`;
            }
            
            console.log(`📄 页面标题: ${currentTitle}`);
            console.log(`🔗 页面URL: ${currentUrl}`);
            console.log(`📁 保存文件名: ${fileName}`);
            
            // 创建保存目录
            const saveDir = 'saved-pages';
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }
            
            const pageDir = path.join(saveDir, fileName);
            if (!fs.existsSync(pageDir)) {
                fs.mkdirSync(pageDir, { recursive: true });
            }
            
            // 1. 保存HTML内容
            console.log('📝 保存HTML内容...');
            const htmlContent = await page.content();
            const htmlPath = path.join(pageDir, 'index.html');
            fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
            
            // 2. 保存截图
            console.log('📸 保存页面截图...');
            const screenshotPath = path.join(pageDir, 'screenshot.png');
            await page.screenshot({ 
                path: screenshotPath, 
                fullPage: true,
                type: 'png'
            });
            
            // 3. 保存PDF
            console.log('📄 保存PDF文件...');
            const pdfPath = path.join(pageDir, 'page.pdf');
            await page.pdf({ 
                path: pdfPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1cm',
                    right: '1cm',
                    bottom: '1cm',
                    left: '1cm'
                }
            });
            
            // 4. 提取并保存所有CSS
            console.log('🎨 提取并保存CSS样式...');
            const cssContent = await this.extractAllCSS(page);
            const cssPath = path.join(pageDir, 'styles.css');
            fs.writeFileSync(cssPath, cssContent, 'utf-8');
            
            // 5. 提取并保存JavaScript
            console.log('⚙️ 提取页面JavaScript...');
            const jsContent = await this.extractPageJS(page);
            const jsPath = path.join(pageDir, 'scripts.js');
            fs.writeFileSync(jsPath, jsContent, 'utf-8');
            
            // 6. 保存页面信息
            console.log('📋 保存页面元数据...');
            const metadata = {
                url: currentUrl,
                title: currentTitle,
                timestamp: new Date().toISOString(),
                fileName: fileName,
                files: {
                    html: 'index.html',
                    screenshot: 'screenshot.png',
                    pdf: 'page.pdf',
                    css: 'styles.css',
                    js: 'scripts.js'
                }
            };
            
            const metadataPath = path.join(pageDir, 'metadata.json');
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
            
            // 7. 创建可离线查看的HTML文件
            console.log('🌐 创建离线查看版本...');
            const offlineHtml = await this.createOfflineVersion(htmlContent, cssContent, jsContent, metadata);
            const offlinePath = path.join(pageDir, 'offline.html');
            fs.writeFileSync(offlinePath, offlineHtml, 'utf-8');
            
            const result = {
                success: true,
                directory: pageDir,
                files: {
                    html: htmlPath,
                    screenshot: screenshotPath,
                    pdf: pdfPath,
                    css: cssPath,
                    js: jsPath,
                    metadata: metadataPath,
                    offline: offlinePath
                },
                metadata: metadata
            };
            
            this.savedPages.push(result);
            
            console.log('✅ 网页保存完成！');
            console.log(`📁 保存目录: ${pageDir}`);
            console.log(`🌐 离线查看: ${offlinePath}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ 保存网页失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 提取所有CSS样式
     * @param {Page} page - Playwright页面对象
     * @returns {string} 合并的CSS内容
     */
    async extractAllCSS(page) {
        return await page.evaluate(() => {
            let allCSS = '';
            
            // 提取内联样式表
            const styleSheets = Array.from(document.styleSheets);
            styleSheets.forEach((sheet, index) => {
                try {
                    allCSS += `/* Stylesheet ${index + 1} */\n`;
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    rules.forEach(rule => {
                        allCSS += rule.cssText + '\n';
                    });
                    allCSS += '\n';
                } catch (e) {
                    allCSS += `/* Could not access stylesheet ${index + 1}: ${e.message} */\n\n`;
                }
            });
            
            // 提取内联样式
            const elementsWithStyle = document.querySelectorAll('[style]');
            if (elementsWithStyle.length > 0) {
                allCSS += '/* Inline Styles */\n';
                elementsWithStyle.forEach((element, index) => {
                    const tagName = element.tagName.toLowerCase();
                    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
                    const id = element.id ? `#${element.id}` : '';
                    allCSS += `/* Element ${index + 1}: ${tagName}${id}${className} */\n`;
                    allCSS += `/* style="${element.getAttribute('style')}" */\n\n`;
                });
            }
            
            return allCSS;
        });
    }

    /**
     * 提取页面JavaScript
     * @param {Page} page - Playwright页面对象
     * @returns {string} JavaScript内容
     */
    async extractPageJS(page) {
        return await page.evaluate(() => {
            let allJS = '';
            
            // 提取script标签内容
            const scripts = document.querySelectorAll('script');
            scripts.forEach((script, index) => {
                if (script.src) {
                    allJS += `/* External Script ${index + 1}: ${script.src} */\n`;
                } else if (script.textContent) {
                    allJS += `/* Inline Script ${index + 1} */\n`;
                    allJS += script.textContent + '\n\n';
                }
            });
            
            return allJS;
        });
    }

    /**
     * 创建可离线查看的HTML版本
     * @param {string} htmlContent - HTML内容
     * @param {string} cssContent - CSS内容
     * @param {string} jsContent - JavaScript内容
     * @param {Object} metadata - 页面元数据
     * @returns {string} 离线HTML内容
     */
    async createOfflineVersion(htmlContent, cssContent, jsContent, metadata) {
        // 在HTML中嵌入CSS和JS
        const offlineHtml = htmlContent.replace(
            '</head>',
            `
            <style>
            /* Extracted CSS Styles */
            ${cssContent}
            </style>
            <script>
            /* Page Metadata */
            window.pageMetadata = ${JSON.stringify(metadata, null, 2)};
            
            /* Extracted JavaScript */
            ${jsContent}
            </script>
            </head>`
        );
        
        return offlineHtml;
    }

    /**
     * 获取已保存的页面列表
     * @returns {Array} 保存的页面列表
     */
    getSavedPages() {
        return this.savedPages;
    }

    /**
     * 清理旧的保存文件
     * @param {number} daysOld - 删除多少天前的文件
     */
    cleanupOldSaves(daysOld = 7) {
        const saveDir = 'saved-pages';
        if (!fs.existsSync(saveDir)) return;
        
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        const dirs = fs.readdirSync(saveDir);
        dirs.forEach(dir => {
            const dirPath = path.join(saveDir, dir);
            const stats = fs.statSync(dirPath);
            
            if (stats.isDirectory() && stats.mtime.getTime() < cutoffTime) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`🗑️ 清理旧文件: ${dirPath}`);
            }
        });
    }
}

module.exports = { PageSaver };
