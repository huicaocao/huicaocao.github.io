/**
 * Supabase 配置文件
 * 
 * 请按照以下步骤设置您的Supabase项目：
 * 1. 访问 https://app.supabase.com/ 创建一个新项目
 * 2. 在项目中创建一个名为"players"的表，包含以下字段：
 *    - gameId (text, primary key)
 *    - status (text)
 *    - nickname (text)
 *    - timestamp (bigint)
 * 3. 获取项目的配置信息并填入下方
 */

// Supabase 配置
const supabaseConfig = {
    url: "https://jtlgvnkexwubuprvgwti.supabase.co",  // 替换为您的Supabase项目URL
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bGd2bmtleHd1YnVwcnZnd3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjAyODEsImV4cCI6MjA3MTIzNjI4MX0.eXVbchsGXYMc6F-3biHMd9xSJ3hJfAvx-rsuWRaVHtU"  // 替换为您的Supabase匿名访问密钥
};

// 初始化 Supabase 客户端
const { createClient } = supabase;
const supabase = createClient(supabaseConfig.url, supabaseConfig.key);

// 导出客户端
if (typeof window !== 'undefined') {
    window.supabase = supabase;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabase;
}