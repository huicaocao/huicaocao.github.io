/**
 * GitHub API 工具类
 * 提供与GitHub API交互的功能，用于读取和写入数据到仓库中的JSON文件
 */

// GitHub API 操作类
class GitHubAPI {
    constructor(githubToken) {
        this.githubToken = githubToken;
        this.owner = githubConfig.owner;
        this.repo = githubConfig.repo;
        this.dataFile = githubConfig.dataFile;
    }

    /**
     * 获取文件内容
     * @returns {Promise<Object>} 文件内容解析后的JSON对象
     */
    async getFileContent() {
        try {
            const url = githubConfig.getFileContentUrl();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // 解码base64内容
            const content = atob(data.content);
            return JSON.parse(content);
        } catch (error) {
            console.error('获取文件内容失败:', error);
            throw error;
        }
    }

    /**
     * 更新文件内容
     * @param {Object} newContent 新的文件内容对象
     * @returns {Promise<Object>} API响应
     */
    async updateFile(newContent) {
        try {
            // 首先获取当前文件的SHA值和内容
            const url = githubConfig.getFileContentUrl();
            const getResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!getResponse.ok) {
                throw new Error(`获取文件信息失败: ${getResponse.status} ${getResponse.statusText}`);
            }

            const fileInfo = await getResponse.json();
            const sha = fileInfo.sha;

            // 准备更新请求
            const updateUrl = githubConfig.getCommitFileUrl();
            const content = btoa(JSON.stringify(newContent, null, 2));
            const commitMessage = `Update player data: ${new Date().toISOString()}`;

            const updateResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: content,
                    sha: sha
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`更新文件失败: ${updateResponse.status} ${updateResponse.statusText}\n${JSON.stringify(errorData)}`);
            }

            return await updateResponse.json();
        } catch (error) {
            console.error('更新文件内容失败:', error);
            throw error;
        }
    }

    /**
     * 存储玩家数据
     * @param {string} gameId 游戏ID
     * @param {string} status 状态
     * @param {string} nickname 昵称
     * @returns {Promise<Object>} API响应
     */
    async savePlayerData(gameId, status, nickname) {
        try {
            // 获取当前数据
            const currentData = await this.getFileContent();
            const players = currentData.players || {};
            
            // 更新或添加玩家数据
            players[gameId] = {
                gameId: gameId,
                status: status,
                nickname: nickname,
                timestamp: Date.now()
            };
            
            // 保存更新后的数据
            const updatedData = {
                ...currentData,
                players: players
            };
            
            return await this.updateFile(updatedData);
        } catch (error) {
            console.error('保存玩家数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有玩家数据
     * @returns {Promise<Object>} 玩家数据对象
     */
    async getAllPlayers() {
        try {
            const data = await this.getFileContent();
            return data.players || {};
        } catch (error) {
            console.error('获取玩家数据失败:', error);
            // 如果获取失败，返回示例数据以便演示
            return {
                "12345678": {
                    "gameId": "12345678",
                    "status": "魔潮帮帮！",
                    "nickname": "示例玩家1",
                    "timestamp": Date.now() - 86400000
                },
                "87654321": {
                    "gameId": "87654321",
                    "status": "来我家园玩~",
                    "nickname": "示例玩家2",
                    "timestamp": Date.now() - 172800000
                }
            };
        }
    }
};

// 在浏览器环境中导出类
if (typeof window !== 'undefined') {
    window.GitHubAPI = GitHubAPI;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}