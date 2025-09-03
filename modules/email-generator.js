// 📧 邮箱生成模块
class EmailGenerator {
    constructor() {
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        this.domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    }

    /**
     * 生成随机邮箱
     * @param {number} length - 用户名长度，默认10位
     * @param {string} domain - 邮箱域名，默认gmail.com
     * @returns {string} 生成的邮箱地址
     */
    generateRandomEmail(length = 10, domain = 'gmail.com') {
        let randomString = '';
        
        // 生成指定长度的随机字符串
        for (let i = 0; i < length; i++) {
            randomString += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
        }
        
        return `${randomString}@${domain}`;
    }

    /**
     * 生成多个随机邮箱
     * @param {number} count - 生成数量
     * @param {number} length - 用户名长度
     * @returns {Array<string>} 邮箱数组
     */
    generateMultipleEmails(count = 5, length = 10) {
        const emails = [];
        for (let i = 0; i < count; i++) {
            const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
            emails.push(this.generateRandomEmail(length, domain));
        }
        return emails;
    }

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 生成带时间戳的邮箱（避免重复）
     * @param {string} prefix - 前缀
     * @param {string} domain - 域名
     * @returns {string} 带时间戳的邮箱
     */
    generateTimestampEmail(prefix = 'user', domain = 'gmail.com') {
        const timestamp = Date.now().toString().slice(-6); // 取后6位时间戳
        const randomSuffix = Math.random().toString(36).substring(2, 5); // 3位随机字符
        return `${prefix}${timestamp}${randomSuffix}@${domain}`;
    }
}

module.exports = { EmailGenerator };
