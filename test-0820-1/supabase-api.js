/**
 * Supabase API 工具类
 * 提供与Supabase数据库交互的功能，用于读取和写入玩家数据
 */

// 确保supabase客户端已初始化
if (typeof supabase === 'undefined') {
    console.error('Supabase客户端未初始化，请确保已引入supabase-config.js和supabase.js');
}

// Supabase API 操作类
class SupabaseAPI {
    constructor() {
        if (!window.supabase) {
            throw new Error('Supabase客户端未初始化');
        }
        this.supabase = window.supabase;
        this.table = 'players';
    }

    /**
     * 保存玩家数据
     * @param {string} gameId 游戏ID
     * @param {string} status 状态
     * @param {string} nickname 昵称
     * @returns {Promise<Object>} API响应
     */
    async savePlayerData(gameId, status, nickname) {
        try {
            const timestamp = Date.now();
            
            // 使用upsert方法，不存在则插入，存在则更新
            const { data, error } = await this.supabase
                .from(this.table)
                .upsert({
                    gameId: gameId,
                    status: status,
                    nickname: nickname,
                    timestamp: timestamp
                })
                .eq('gameId', gameId);
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('保存玩家数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有玩家数据
     * @returns {Promise<Array>} 玩家数据数组
     */
    async getAllPlayers() {
        try {
            const { data, error } = await this.supabase
                .from(this.table)
                .select('*');
            
            if (error) {
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('获取玩家数据失败:', error);
            // 如果获取失败，返回示例数据以便演示
            return [
                {
                    gameId: "12345678",
                    status: "魔潮帮帮！",
                    nickname: "示例玩家1",
                    timestamp: Date.now() - 86400000
                },
                {
                    gameId: "87654321",
                    status: "来我家园玩~",
                    nickname: "示例玩家2",
                    timestamp: Date.now() - 172800000
                }
            ];
        }
    }

    /**
     * 获取指定状态的玩家数据
     * @param {string} status 状态
     * @returns {Promise<Array>} 玩家数据数组
     */
    async getPlayersByStatus(status) {
        try {
            const { data, error } = await this.supabase
                .from(this.table)
                .select('*')
                .eq('status', status)
                .order('timestamp', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error(`获取状态为"${status}"的玩家数据失败:`, error);
            return [];
        }
    }

    /**
     * 删除过期数据（超过7天）
     * @returns {Promise<Object>} API响应
     */
    async deleteExpiredData() {
        try {
            // 计算7天前的时间戳
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            
            const { data, error } = await this.supabase
                .from(this.table)
                .delete()
                .lt('timestamp', sevenDaysAgo);
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('删除过期数据失败:', error);
            throw error;
        }
    }
}

// 在浏览器环境中导出类
if (typeof window !== 'undefined') {
    window.SupabaseAPI = SupabaseAPI;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseAPI;
}