// 📊 CSV文件读取模块
const fs = require('fs');
const path = require('path');

class CSVReader {
    constructor() {
        this.csvData = [];
    }

    /**
     * 读取CSV文件
     * @param {string} filePath - CSV文件路径
     * @returns {Array} CSV数据数组
     */
    readCSV(filePath) {
        try {
            console.log(`📊 读取CSV文件: ${filePath}`);
            
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`CSV文件不存在: ${filePath}`);
            }
            
            // 读取文件内容
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            
            // 按行分割
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length === 0) {
                throw new Error('CSV文件为空');
            }
            
            // 解析CSV数据
            this.csvData = lines.map(line => {
                // 简单的CSV解析（处理逗号分隔）
                return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            });
            
            console.log(`✅ CSV文件读取成功，共 ${this.csvData.length} 行数据`);
            console.log(`📋 第一行数据: ${this.csvData[0]?.join(', ')}`);
            
            return this.csvData;
            
        } catch (error) {
            console.error(`❌ 读取CSV文件失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取指定位置的数据
     * @param {number} row - 行号（从0开始）
     * @param {number} col - 列号（从0开始）
     * @returns {string} 单元格数据
     */
    getCell(row, col) {
        try {
            if (row >= this.csvData.length) {
                throw new Error(`行号超出范围: ${row}, 总行数: ${this.csvData.length}`);
            }
            
            if (col >= this.csvData[row].length) {
                throw new Error(`列号超出范围: ${col}, 该行总列数: ${this.csvData[row].length}`);
            }
            
            const cellData = this.csvData[row][col];
            console.log(`📍 获取单元格数据 [${row}, ${col}]: ${cellData}`);
            
            return cellData;
            
        } catch (error) {
            console.error(`❌ 获取单元格数据失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取第一列第二行的数据（行号1，列号0）
     * @returns {string} 链接数据
     */
    getFirstColumnSecondRow() {
        return this.getCell(1, 0); // 第二行（索引1），第一列（索引0）
    }

    /**
     * 获取所有数据
     * @returns {Array} 完整的CSV数据数组
     */
    getAllData() {
        return this.csvData;
    }

    /**
     * 获取指定行的所有数据
     * @param {number} row - 行号（从0开始）
     * @returns {Array} 该行的所有数据
     */
    getRow(row) {
        if (row >= this.csvData.length) {
            throw new Error(`行号超出范围: ${row}, 总行数: ${this.csvData.length}`);
        }
        
        return this.csvData[row];
    }

    /**
     * 获取指定列的所有数据
     * @param {number} col - 列号（从0开始）
     * @returns {Array} 该列的所有数据
     */
    getColumn(col) {
        return this.csvData.map(row => {
            if (col >= row.length) {
                return '';
            }
            return row[col];
        });
    }

    /**
     * 打印CSV数据预览
     * @param {number} maxRows - 最大显示行数
     */
    printPreview(maxRows = 5) {
        console.log('📊 CSV数据预览:');
        console.log('================');
        
        const rowsToShow = Math.min(maxRows, this.csvData.length);
        
        for (let i = 0; i < rowsToShow; i++) {
            console.log(`行 ${i}: ${this.csvData[i].join(' | ')}`);
        }
        
        if (this.csvData.length > maxRows) {
            console.log(`... 还有 ${this.csvData.length - maxRows} 行数据`);
        }
        
        console.log('================');
    }

    /**
     * 验证链接格式
     * @param {string} link - 要验证的链接
     * @returns {boolean} 是否为有效链接
     */
    validateLink(link) {
        try {
            new URL(link);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 在CSV文件的指定行第三列添加备注
     * @param {number} row - 行号（从0开始）
     * @param {string} note - 备注内容
     * @param {string} filePath - CSV文件路径
     */
    addNoteToCSV(row, note, filePath) {
        try {
            console.log(`📝 在第 ${row + 1} 行第3列添加备注: ${note}`);

            // 确保第三列存在
            if (this.csvData[row].length < 3) {
                // 补齐到第三列
                while (this.csvData[row].length < 3) {
                    this.csvData[row].push('');
                }
            }

            // 添加备注到第三列
            this.csvData[row][2] = note;

            // 将更新后的数据写回文件
            const csvContent = this.csvData.map(row =>
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n');

            fs.writeFileSync(filePath, csvContent, 'utf-8');
            console.log(`✅ CSV备注添加成功: 第 ${row + 1} 行第3列 = "${note}"`);

            return true;

        } catch (error) {
            console.error(`❌ 添加CSV备注失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 创建示例CSV文件
     * @param {string} filePath - 文件路径
     */
    createSampleCSV(filePath) {
        const sampleData = [
            ['链接', '标题', '描述'],
            ['https://www.bilibili.com/video/BV1234567890', '示例视频1', '这是一个示例视频'],
            ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', '示例视频2', '这是另一个示例视频'],
            ['https://www.bilibili.com/video/BV0987654321', '示例视频3', '第三个示例视频']
        ];
        
        const csvContent = sampleData.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        fs.writeFileSync(filePath, csvContent, 'utf-8');
        console.log(`✅ 示例CSV文件已创建: ${filePath}`);
    }
}

module.exports = { CSVReader };
