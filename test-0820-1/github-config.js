/**
 * GitHub API 配置文件
 * 
 * 请按照以下步骤设置您的GitHub仓库：
 * 1. 创建一个新的GitHub仓库
 * 2. 将此项目的所有文件上传到仓库
 * 3. 在仓库中创建一个名为"data.json"的文件作为数据存储
 * 4. 生成一个GitHub Personal Access Token (PAT) 用于API访问
 *    (生成地址：https://github.com/settings/tokens)，需要repo权限
 * 5. 在index.html中，您需要实现获取GitHub Token的方式
 */

// GitHub API 配置
const githubConfig = {
    // 仓库信息
    owner: "YOUR_GITHUB_USERNAME",  // 替换为您的GitHub用户名
    repo: "YOUR_REPOSITORY_NAME",   // 替换为您的仓库名称
    dataFile: "data.json",          // 数据存储文件名
    
    // API URL构造函数
    getApiUrl: function(endpoint) {
        return `https://api.github.com/repos/${this.owner}/${this.repo}/${endpoint}`;
    },
    
    // 获取文件内容的API URL
    getFileContentUrl: function() {
        return this.getApiUrl(`contents/${this.dataFile}`);
    },
    
    // 提交文件的API URL
    getCommitFileUrl: function() {
        return this.getApiUrl(`contents/${this.dataFile}`);
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = githubConfig;
}