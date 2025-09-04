# BibiGPT Automation System v2.0

**Language / 语言**: English | [中文](README.md)

🤖 A fully automated BibiGPT video summarization system that supports batch processing of YouTube videos, intelligent error handling, automatic account management, and other advanced features.

## 🙏 Special Thanks

**Thanks to the developers of [BibiGPT](https://github.com/JimmyLv/BibiGPT-v1)!**

This automation system is built upon the excellent open-source project [BibiGPT-v1](https://github.com/JimmyLv/BibiGPT-v1). BibiGPT is an amazing AI audio/video content summarization tool that provides free video content summarization services to users.

- 🎯 **Project Repository**: https://github.com/JimmyLv/BibiGPT-v1
- 🌐 **Online Service**: https://bibigpt.co
- 👨‍💻 **Developer**: [@JimmyLv](https://github.com/JimmyLv)

**Special thanks to the developers for their selfless dedication in providing such an excellent free tool!**

If the developers or maintainers of the BibiGPT project wish me to remove this automation tool, please contact me at any time, and I will delete it immediately. This project is only for learning and researching automation technologies, with no commercial use.

---

## ✨ Core Features

### 🚀 Automated Processing
- **Batch Video Processing** - Automatically loops through all YouTube links in CSV files
- **Intelligent Account Management** - Auto registration, automatic account switching when balance is insufficient
- **Complete Content Saving** - Saves HTML, CSS, JS, screenshots, PDF, and other complete content for each video
- **Intelligent Error Handling** - Automatically identifies and handles various error situations

### 🛡️ Intelligent Error Handling System
- **Automatic Balance Insufficient Handling** - Automatically reopens browser and registers new account when balance is detected as insufficient
- **Failed to Fetch Handling** - Automatically adds remarks to CSV file and skips failed videos
- **Real-time Error Monitoring** - Continuously monitors error status while waiting for page transitions
- **Seamless Recovery Mechanism** - Automatically continues processing flow after error handling

### ⌨️ Simplified Interaction Handling
- **Unified ESC Key Handling** - Press ESC at key positions to close various popups and overlay layers
- **Precise Timing Control** - Press ESC on content pages with 3-second intervals to ensure overlay layers are completely closed
- **Multiple Safety Mechanisms** - Press ESC continuously at each key position to ensure pages are cleaned properly

### 💾 Complete Content Saving Features
- **HTML Source Code** - Complete page structure and content
- **CSS Styles** - All stylesheets and inline styles, maintaining original design
- **JavaScript Code** - Page script content and interaction logic
- **Full Page Screenshots** - High-definition PNG screenshots showing complete page display
- **PDF Documents** - Printable PDF version in A4 format
- **Offline Viewing Version** - Self-contained HTML files that can be viewed without network
- **Metadata Information** - Detailed page information, save time, URL, etc.

### 📊 CSV File Management
- **Automatic Reading and Processing** - Reads YouTube link lists from CSV files
- **Intelligent Remarks Feature** - Automatically adds processing status remarks in the third column
- **Error Recording** - Automatically records errors like "Failed to fetch" to CSV
- **Progress Tracking** - Real-time display of processing progress and success/failure statistics

## 📁 Project Structure

```
BIBIGPT/
├── main.js                    # Main program entry
├── package.json              # Project configuration
├── youtube-2025-09-01.csv    # YouTube link data
├── README.md                 # Project documentation (Chinese)
├── README_EN.md              # Project documentation (English)
├── modules/                  # Function modules
│   ├── email-generator.js    # Email generation module
│   ├── ad-blocker.js        # Ad blocking module
│   ├── form-filler.js       # Form filling module
│   ├── csv-reader.js        # CSV file reading module
│   └── page-saver.js        # Page saving module
└── saved-pages/             # Saved page content
    └── [timestamp]/         # Save directories categorized by timestamp
        ├── index.html       # Original HTML
        ├── offline.html     # Offline viewing version
        ├── screenshot.png   # Page screenshot
        ├── page.pdf        # PDF document
        ├── styles.css      # CSS styles
        ├── scripts.js      # JavaScript code
        └── metadata.json   # Metadata information
```

## 🚀 Quick Start

### Environment Requirements
- Node.js 16+ 
- npm or yarn

### Install Dependencies
```bash
npm install playwright
```

### Install Browser
```bash
npx playwright install chromium
```

### Prepare CSV File
Ensure there's a `youtube-2025-09-01.csv` file in the project root directory with the following format:
```csv
Link,Title,Description
https://www.youtube.com/watch?v=VIDEO_ID,Video Title,Video Description
```

### Run System
```bash
node main.js
```

## 🔄 Complete Automation Process

### Phase 1: System Initialization and Account Registration
1. **Browser Startup**
   - 🌐 Launch Playwright browser (non-headless mode)
   - 🔧 Configure browser parameters and timeout settings

2. **Automatic Registration Process**
   - 🌐 Visit registration page `https://bibigpt.co/r/bilibili`
   - ⌨️ Press ESC to close popups (3 times, 500ms intervals)
   - 📧 Generate random email address (format: bibigpt[random]@gmail.com)
   - 📝 Automatically fill email and password (password same as email)
   - ✅ Submit registration form and wait for completion

### Phase 2: Batch Video Processing Loop

#### Loop Initialization
- 📊 Read CSV file (default: `youtube-2025-09-01.csv`)
- 🔍 Validate CSV format and data integrity
- 🎯 Start processing from row 2 (skip header row)
- 📈 Display total video count and processing plan

#### Standard Processing Flow for Each Round

##### 1. Desktop Page Access
```
🌐 Navigate to https://bibigpt.co/desktop
⌨️ Press ESC to close popups (3 times, 500ms intervals)
🔍 Verify page loading completion
```

##### 2. Video Link Processing
```
📊 Read YouTube link from CSV row N, column 1
🔍 Validate link format validity
📝 Locate video link input box: textarea[data-slot="textarea"]
🧹 Clear existing content
📝 Input video link
⌨️ Press Enter to submit
⏰ Wait 5 seconds for processing results
```

##### 3. Real-time Error Monitoring
```
👀 Monitor page transition to /content/ page (max 60 seconds, check every 2 seconds)
🔍 Simultaneously detect error states:
   💳 Balance insufficient: "余额不足啦", "请升级会员或购买时长哦"
   ❌ Network errors: "Failed to fetch", "fetch failed"
⚡ Process errors immediately upon detection
```

##### 4. Content Page Processing
```
⏰ Wait for content page to fully load (3 seconds)
💳 Check balance status
⌨️ 1st ESC key press to close overlay
⏰ Wait 3 seconds
⌨️ 2nd ESC key press for cleanup confirmation
⏰ Wait for content stabilization (5 seconds)
🔽 Click processing queue dropdown button
```

##### 5. Complete Content Saving
```
💾 Save complete page content:
   📄 index.html - Original HTML source code
   🌐 offline.html - Offline viewing version (includes all CSS/JS)
   📸 screenshot.png - Full page high-definition screenshot
   📄 page.pdf - A4 format PDF document
   🎨 styles.css - Extracted all CSS styles
   ⚙️ scripts.js - Page JavaScript code
   📋 metadata.json - Page metadata and save information
📁 Store in saved-pages/[timestamp]/ directory
```

##### 6. Loop Control
```
📈 Current row number +1
🔄 Continue to next round if max rows not reached
⏰ Wait 2 seconds between rounds
📊 Real-time display of processing progress
```

### 🎯 Intelligent Error Handling Mechanisms

#### Balance Insufficient Handling Process
```
Detect balance insufficient → Close current browser → Launch new browser → Re-register new account → Retry current video
```

#### Failed to Fetch Handling Process
```
Detect network error → Add "Failed to fetch" remark to CSV column 3 → Skip current video → Continue to next video
```

### 🔧 System Features
- **Fully Automated** - No manual intervention required, automatically handles all processes
- **Intelligent Error Recovery** - Automatically identifies and handles various error situations
- **Complete Data Saving** - Saves multiple formats for each video, ensuring content integrity
- **Real-time Progress Tracking** - Displays detailed processing progress and status information
- **Intelligent CSV Management** - Automatically updates CSV files, records processing status

## ⚙️ Detailed Configuration Options

### Main System Configuration
```javascript
this.config = {
    registerUrl: 'https://bibigpt.co/r/bilibili',  // BibiGPT registration page URL
    desktopUrl: 'https://bibigpt.co/desktop',      // BibiGPT desktop page URL
    csvFilePath: 'youtube-2025-09-01.csv',        // CSV data file path
    headless: false,                               // Browser display mode (false=visible)
    slowMo: 500,                                   // Operation delay (milliseconds)
    timeout: 30000                                 // Page load timeout (milliseconds)
};
```

### Loop Processing Configuration
```javascript
// Loop control parameters
this.currentRow = 1;        // Starting row number (from row 2, skip header)
this.maxRows = 0;          // Total CSV rows (auto-read)

// Wait time configuration
const maxAttempts = 30;     // Maximum wait attempts (waiting for content page)
const waitInterval = 2000;  // Check interval time (milliseconds)
const escInterval = 3000;   // ESC key interval time (milliseconds)
const contentStableWait = 5000; // Content stabilization wait time (milliseconds)
```

### Error Handling Configuration
```javascript
// Balance insufficient detection keywords
const paymentTexts = [
    "余额不足啦",
    "请升级会员或购买时长哦"
];

// Failed to fetch detection keywords
const fetchErrorTexts = [
    "Failed to fetch",
    "fetch failed",
    "网络请求失败",
    "请求失败"
];
```

### Custom CSV File
1. **Modify configuration file path**:
   ```javascript
   csvFilePath: 'your-custom-file.csv'
   ```

2. **CSV file format requirements**:
   ```csv
   Link,Title,Remarks
   https://www.youtube.com/watch?v=VIDEO_ID1,Video Title 1,
   https://www.youtube.com/watch?v=VIDEO_ID2,Video Title 2,
   ```

3. **CSV file description**:
   - Column 1: YouTube video link (required)
   - Column 2: Video title (optional)
   - Column 3: Remarks information (automatically filled by system with error information)

## 🛡️ Intelligent Error Handling Details

### Real-time Error Monitoring System
The system checks page content every 2 seconds while waiting for page transitions, monitoring the following errors in real-time:

#### 1. Balance Insufficient Error Handling
**Detection Conditions**:
- Page contains text: "余额不足啦"
- Page contains text: "请升级会员或购买时长哦"

**Handling Process**:
```
Detect balance insufficient
    ↓
Close current browser instance
    ↓
Launch new browser
    ↓
Automatically register new account
    ↓
Retry current failed video
    ↓
Continue normal processing flow
```

#### 2. Failed to Fetch Error Handling
**Detection Conditions**:
- Page contains text: "Failed to fetch"
- Page contains text: "fetch failed"
- Page contains text: "网络请求失败"
- Page contains text: "请求失败"

**Handling Process**:
```
Detect network error
    ↓
Add "Failed to fetch" remark to CSV column 3
    ↓
Save CSV file update
    ↓
Skip current video
    ↓
Continue processing next video
```

### ⌨️ ESC Key Handling Mechanism

#### Unified ESC Key Handling Strategy
- **Registration Page** - Press ESC 3 times consecutively, 500ms intervals, clear registration page popups
- **Desktop Page** - Press ESC 3 times consecutively, 500ms intervals, clear input page popups
- **Content Page** - Press ESC 2 times, 3-second intervals, specifically handle guidance overlay layers

#### ESC Handling Timing
1. **After Page Load** - Press ESC immediately after each page loads for cleanup
2. **Before Link Input** - Ensure input box is visible and operable
3. **After Content Page Stabilization** - Handle BibiGPT-specific guidance overlay layers

#### Technical Advantages
- **Simple and Reliable** - No complex DOM listening, direct key handling
- **Standards Compatible** - Complies with Web accessibility design standards
- **Widely Applicable** - Suitable for various types of popups and overlay layers
- **Precise Timing** - Adjusts key timing based on different page characteristics

## 💾 Complete Content Saving Details

### Saved File Types and Purposes

#### Core Content Files
- **📄 index.html** - Original page HTML source code, maintains BibiGPT original structure
- **🌐 offline.html** - Offline viewing version, embeds all CSS and JS, can be opened independently
- **📸 screenshot.png** - Full page high-definition screenshot, PNG format, complete visual display
- **📄 page.pdf** - A4 format PDF document, suitable for printing and long-term storage

#### Technical Resource Files
- **🎨 styles.css** - Extracted all CSS styles, including inline styles and external stylesheets
- **⚙️ scripts.js** - Page JavaScript code, including inline scripts and external scripts
- **📋 metadata.json** - Page metadata, including URL, title, save time, and other information

### Save Directory Structure
```
saved-pages/
└── bibigpt-[CONTENT_ID]-[TIMESTAMP]/
    ├── index.html          # Original HTML
    ├── offline.html        # Offline version ⭐ Recommended viewing
    ├── screenshot.png      # Page screenshot
    ├── page.pdf           # PDF document
    ├── styles.css         # CSS styles
    ├── scripts.js         # JavaScript code
    └── metadata.json      # Metadata information
```

### Methods to View Saved Content

#### 1. Quick View (Recommended)
```
1. Open saved-pages/ directory
2. Select corresponding timestamp folder
3. Double-click offline.html file
4. View complete content in browser (no network required)
```

#### 2. Detailed Analysis
```
- index.html: View original HTML structure
- styles.css: Analyze page style design
- scripts.js: Understand page interaction logic
- metadata.json: View detailed save information
- screenshot.png: Quick preview of page appearance
- page.pdf: Print or long-term archive
```

### File Naming Rules
```
Directory name format: bibigpt-[CONTENT_ID]-[TIMESTAMP]
Example: bibigpt-c5885e45-067f-4d8d-b-2025-09-03T22-19-44-345Z

Where:
- CONTENT_ID: Unique identifier for BibiGPT content page
- TIMESTAMP: Save timestamp (ISO format)
```

## 🔧 Troubleshooting

### Common Issues

**Q: Browser fails to start**
A: Ensure Playwright browser is installed: `npx playwright install chromium`

**Q: CSV file reading failure**
A: Check file path and format, ensure CSV file exists and format is correct

**Q: Registration failure**
A: Check network connection, ensure BibiGPT website is accessible

**Q: Page saving failure**
A: Ensure sufficient disk space, check file write permissions

### Debug Mode
Set `headless: false` to see browser operation process for debugging.

## 📊 System Performance and Statistics

### Processing Capability
- **Batch Processing** - Supports processing dozens to hundreds of video links
- **Concurrency Control** - Single-threaded sequential processing ensures stability
- **Error Recovery** - Automatically handles various error situations without manual intervention
- **Resource Management** - Intelligently manages browser resources, avoids memory leaks

### Save Statistics
- **Per Video** - Saves 7 different format files
- **Storage Space** - About 5-20MB per video (depends on content complexity)
- **Save Speed** - Complete save takes about 10-30 seconds per video
- **Success Rate** - >95% success rate in normal network environment

### Time Estimation
```
Single video processing time:
- Page loading: 5-10 seconds
- Content generation: 30-120 seconds (depends on video length)
- Content saving: 10-30 seconds
- Total: 45-160 seconds/video

Batch processing examples:
- 50 videos: about 2-4 hours
- 100 videos: about 4-8 hours
```

## 📝 Version Update Log

### v2.0.0 (Current Version) - Intelligent Error Handling Version
**🎉 Major Feature Updates**
- ✅ **Intelligent Error Handling System** - Automatically identifies and handles balance insufficient, network errors
- ✅ **New Browser Re-registration** - Automatically reopens browser and registers new account when balance insufficient
- ✅ **CSV Intelligent Remarks Feature** - Automatically records error status in CSV file
- ✅ **Real-time Error Monitoring** - Continuously monitors errors while waiting for page transitions
- ✅ **Failed to Fetch Handling** - Automatically skips and records network errors
- ✅ **Complete Loop Processing System** - Batch processes all video links
- ✅ **Processing Queue Dropdown Button** - Automatically clicks processing queue expand button
- ✅ **Enhanced Content Saving** - Complete saving of each video content in 7 formats

**🔧 Technical Improvements**
- ✅ Simplified ESC key popup handling, removed complex DOM listening
- ✅ Standardized operation flow for each round, improved stability
- ✅ Optimized wait time configuration, improved processing efficiency
- ✅ Enhanced error logging, convenient for troubleshooting

### v1.0.0 - Basic Automation Version
- ✅ Basic automatic registration functionality
- ✅ CSV link reading and processing
- ✅ Content page monitoring
- ✅ Basic content saving functionality

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## 📄 License

MIT License

## 🚀 Usage Recommendations and Best Practices

### Pre-use Preparation
1. **Network Environment** - Ensure stable network connection, wired network recommended
2. **CSV File Preparation** - Ensure YouTube link format is correct, recommend testing small number of links first
3. **Storage Space** - Ensure sufficient disk space (about 5-20MB per video)
4. **Time Planning** - Batch processing requires considerable time, recommend running during idle periods

### Runtime Monitoring
- **Real-time Logs** - Pay attention to console output to understand processing progress and status
- **Error Handling** - System automatically handles most errors, no manual intervention required
- **Progress Tracking** - System displays current processing video row number and total progress
- **File Checking** - Regularly check saved-pages directory to confirm save results

### Performance Optimization Recommendations
- **Batch Processing** - For large numbers of videos, recommend batch processing (50-100 per batch)
- **Regular Cleanup** - Regularly clean old files in saved-pages directory
- **System Resources** - Ensure sufficient system memory (8GB+ recommended)
- **Browser Management** - System automatically manages browser, no manual operation required

## ⚠️ Important Notes and Disclaimer

### Usage Limitations
- **For Learning and Research Only** - This tool is only for learning automation technologies and research purposes
- **Comply with Terms of Service** - Please comply with BibiGPT and YouTube terms of service when using
- **Reasonable Use** - Avoid excessive frequent requests to prevent server pressure
- **Data Security** - Generated emails and passwords are only for temporary registration, do not use for important purposes

### Technical Limitations
- **Network Dependency** - Requires stable network connection, network issues may affect processing results
- **Page Changes** - BibiGPT page structure changes may affect system operation
- **Browser Compatibility** - Based on Chromium browser, other browsers may not be compatible
- **System Resources** - Long-term operation may consume considerable system resources

### Legal Responsibility
Users are responsible for their own actions, developers do not assume any legal responsibility arising from the use of this tool.

---

## 🎉 Summary

**BibiGPT Automation System v2.0** is a feature-complete, highly intelligent video content batch processing tool. Through intelligent error handling, automatic account management, complete content saving, and other features, it achieves truly unattended batch processing.

**Core Advantages:**
- 🤖 **Fully Automated** - Complete automation from registration to saving
- 🛡️ **Intelligent Error Handling** - Automatically identifies and handles various error situations
- 💾 **Complete Content Saving** - 7 formats ensure content integrity
- 📊 **Efficient Batch Processing** - Supports processing large numbers of video links
- 🔄 **Seamless Error Recovery** - Automatically recovers and continues processing after errors

**Enjoy the convenience of automation!** If you have any issues, please check the troubleshooting section or submit an Issue.
