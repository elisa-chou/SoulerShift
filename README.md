# 寫樂排班表系統 📅

一個現代化的響應式排班表網頁應用程式，支援多人即時協作。

[![部署狀態](https://img.shields.io/badge/deploy-success-brightgreen)]()
[![License](https://img.shields.io/badge/license-Private-blue)]()

## 🌟 功能特色

- ✨ **雙週排班** - 同時顯示兩週的排班資訊（週一至週五）
- 👥 **三人協作** - 為星貞、國渝、樹穎三位員工排班
- 🎨 **視覺化設計** - 不同員工使用不同顏色區分
- 🔄 **彈性排班** - 支援全天班、上午班、下午班
- 📝 **備註功能** - 每週可添加備註資訊
- 🧹 **打掃排程** - 指定每週打掃人員
- ☁️ **雲端同步** - 使用 Firebase 即時同步資料
- 📱 **響應式設計** - 支援桌面、平板、手機瀏覽

## 🚀 快速開始

### 線上使用

直接訪問：`https://elisa-chou.github.io/SoulerShift/`

> 部署完成後，請將上方網址替換為實際網址

### 本地測試

1. Clone 此專案：
```bash
git clone https://github.com/您的帳號/您的repo名稱.git
cd 您的repo名稱
```

2. 開啟 `index.html`：
```bash
# 方法 1：直接雙擊 index.html

# 方法 2：使用本地伺服器（推薦）
python -m http.server 8000
# 然後訪問 http://localhost:8000
```

## 📖 使用說明

### 基本操作

#### 1. 設定日期
- 點擊日期輸入框選擇該週的開始日期（週一）
- 系統會自動計算並顯示週一到週五的日期

#### 2. 排班操作
- 點擊員工卡片可切換排班狀態
- 狀態順序：**未排班** → **全天班** → **上午班** → **下午班** → **未排班**
- **全天班**：深色底色，無文字標註
- **上午/下午班**：淺色底色，紅色文字標註

#### 3. 指定打掃人員
- 使用下拉選單選擇本週打掃人員
- 選擇後背景會顯示該員工的代表色

#### 4. 添加備註
- 在右側備註欄輸入本週的特殊事項

#### 5. 清空週資料
- 點擊「清空」按鈕可清除該週所有資料
- 系統會要求確認以防誤操作

### 多人協作

- 所有修改會自動同步到雲端
- 其他人的瀏覽器會即時更新資料
- 無需重新整理頁面

### 配色說明

- 🟢 **星貞** - 綠色系
- 🟡 **國渝** - 橘黃色系
- 🔵 **樹穎** - 藍紫色系

## 🛠️ 技術架構

- **前端**：HTML5 / CSS3 / JavaScript (ES6+)
- **資料庫**：Firebase Firestore
- **部署**：GitHub Pages
- **設計**：響應式設計（支援所有裝置）

## 📁 專案結構

```
寫樂排班表/
├── index.html      # 主要 HTML 結構
├── styles.css      # 樣式表（響應式設計）
├── script.js       # JavaScript 邏輯與 Firebase 整合
└── README.md       # 專案說明文件
```

## 🔧 自訂設定

### 修改員工名稱

編輯 `script.js` 第 19-23 行：

```javascript
const employees = [
    { name: '星貞', label: 'A' },
    { name: '國渝', label: 'B' },
    { name: '樹穎', label: 'C' }
];
```

### 調整顯示天數

如果要顯示週末，修改 `script.js` 第 68 行：

```javascript
// 改為顯示整週（包含週末）
for (let day = 1; day <= 7; day++) {
```

並修改第 70 行的日期名稱陣列：

```javascript
const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
```

## 🔒 Firebase 設定

本專案使用 Firebase Firestore 儲存資料。如需部署自己的版本：

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用 Firestore Database

### 2. 設定安全規則

在 Firestore Database → 規則，貼上：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schedules/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. 更新配置

將您的 Firebase 配置更新到 `script.js` 第 2-8 行：

```javascript
const firebaseConfig = {
    apiKey: "您的_API_KEY",
    authDomain: "您的_AUTH_DOMAIN",
    projectId: "您的_PROJECT_ID",
    storageBucket: "您的_STORAGE_BUCKET",
    messagingSenderId: "您的_MESSAGING_SENDER_ID",
    appId: "您的_APP_ID"
};
```

## 📱 瀏覽器支援

- ✅ Chrome / Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ iOS Safari
- ✅ Chrome Android

## ❓ 常見問題

### Q: 資料會保存多久？
**A:** 資料永久保存在 Firebase Firestore，直到手動刪除。

### Q: 可以同時多少人使用？
**A:** Firebase 免費方案支援同時 100 個連線，足夠小團隊使用。

### Q: 如果網路斷線會怎樣？
**A:** 資料會暫存在本地瀏覽器，網路恢復後自動同步到雲端。

### Q: 為什麼我的修改沒有同步？
**A:** 
1. 檢查瀏覽器 Console 是否有錯誤訊息
2. 確認 Firebase 配置是否正確
3. 確認 Firestore 安全規則已設定

### Q: 如何重置所有資料？
**A:**
- 方法 1：點擊「清空」按鈕清除各週資料
- 方法 2：到 Firebase Console 刪除 `schedules/current` 文件

## 🚀 部署到 GitHub Pages

### 方法 1：網頁上傳（最簡單）

1. 建立 GitHub Repository（設為 Public）
2. 上傳 `index.html`、`styles.css`、`script.js`
3. 到 Settings → Pages
4. Source 選擇 `main` branch，Folder 選擇 `/ (root)`
5. 儲存後等待 1-2 分鐘

### 方法 2：使用 Git 命令列

```bash
# 初始化 Git
git init
git add .
git commit -m "初始化排班表系統"

# 推送到 GitHub
git branch -M main
git remote add origin https://github.com/您的帳號/您的repo名稱.git
git push -u origin main

# 啟用 GitHub Pages（需在網頁端設定）
```

### 更新網站

```bash
# 修改檔案後
git add .
git commit -m "更新內容"
git push
```

等待 1-2 分鐘，網站會自動更新。

## 📞 支援與回饋

如有問題或建議，歡迎開 Issue 或 Pull Request。

## 📄 授權

本專案為內部使用專案，版權所有。

---

**Made with ❤️ for 寫樂團隊**

最後更新：2025 年 12 月
