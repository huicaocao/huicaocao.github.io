# 游戏玩家状态提交系统

这是一个基于GitHub Pages和Supabase的游戏玩家状态提交和展示系统，允许玩家提交自己的游戏ID、状态和昵称，并在公开页面上按状态分类展示。系统还会自动删除7天未更新的过期数据。

## 功能特点

- 玩家可以提交游戏ID（8位数字）、状态和昵称
- 状态分为三种："魔潮帮帮！"、"来我家园玩~"、"蹲蹲亲友&同好"
- 在展示页面按状态分类显示所有玩家的信息
- 自动删除7天未更新的过期数据
- 完全基于静态网页和云服务，无需自己维护服务器

## 技术栈

- **前端**：HTML、CSS、JavaScript
- **托管**：GitHub Pages
- **数据存储**：Supabase Database
- **自动化任务**：GitHub Actions

## 配置和部署步骤

### 1. 设置Supabase项目

1. 访问 [Supabase控制台](https://app.supabase.com/) 并创建一个新项目
2. 在项目中创建一个名为 `players` 的表，包含以下字段：
   - `gameId` (text, primary key)
   - `status` (text)
   - `nickname` (text)
   - `timestamp` (bigint)
3. 在**SQL编辑器**中运行以下SQL来创建表：
   ```sql
   CREATE TABLE players (
     gameId TEXT PRIMARY KEY,
     status TEXT NOT NULL,
     nickname TEXT NOT NULL,
     timestamp BIGINT NOT NULL
   );
   ```
4. 在**认证**设置中，设置合适的数据库访问策略
5. 获取项目的URL和密钥：
   - 在**项目设置** > **API**中找到`Project URL`和`anon key`
   - 同样在该页面中，找到`service_role key`（用于自动化任务）

### 2. 配置项目文件

1. 打开 `supabase-config.js` 文件，填入你的Supabase项目配置信息：
   ```javascript
   // Supabase 配置
   const supabaseConfig = {
       url: "YOUR_SUPABASE_URL",  // 替换为您的Supabase项目URL
       key: "YOUR_SUPABASE_ANON_KEY"  // 替换为您的Supabase匿名访问密钥
   };
   ```

### 3. 设置GitHub Pages

1. 将项目推送到GitHub仓库
2. 在仓库的**Settings** > **Pages**中，设置**Source**为`main`分支（或你使用的主要分支）
3. 保存设置，GitHub Pages将自动部署你的网站

### 4. 配置GitHub Secrets用于自动清理

1. 在GitHub仓库的**Settings** > **Secrets and variables** > **Actions**中，添加以下secrets：
   - `SUPABASE_URL`：从Supabase项目设置中获取
   - `SUPABASE_SERVICE_ROLE_KEY`：从Supabase项目设置中获取的service_role密钥

2. GitHub Actions工作流会每天凌晨1点自动运行，删除7天未更新的数据

## 使用说明

1. 访问部署后的GitHub Pages网站
2. 在提交页面填写游戏ID（8位数字）、选择状态、填写昵称，然后点击提交
3. 提交成功后，可以通过链接跳转到查看页面，查看所有玩家按状态分类的信息
4. 系统会自动删除7天未更新的玩家数据

## 重要提示

- 请确保设置合适的Firebase数据库安全规则，以防止滥用
- GitHub Actions的免费版有使用限额，大量数据清理可能会消耗较多运行时间
- 如果需要修改自动清理的时间周期，可以编辑 `.github/workflows/clean-expired-data.yml` 文件中的cron表达式
- 本系统完全基于前端和云服务实现，所有数据存储在Firebase Realtime Database中

## 故障排除

- 如果数据提交失败，请检查Firebase配置和数据库规则
- 如果自动清理任务失败，请检查GitHub Secrets是否正确设置
- 对于Firebase相关问题，请参考[Firebase官方文档](https://firebase.google.com/docs)