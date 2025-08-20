/**
 * Firebase 配置文件
 * 
 * 请按照以下步骤设置您的Firebase项目：
 * 1. 访问 https://console.firebase.google.com/ 创建一个新项目
 * 2. 在项目中启用 Realtime Database
 * 3. 获取项目的配置信息并填入下方
 */

// 初始化 Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 初始化 Firebase 应用
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();