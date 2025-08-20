/**
 * 查看页面脚本
 * 从Supabase读取数据并按状态分组显示
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取各状态列表的DOM元素
    const status1List = document.getElementById('status1List');
    const status2List = document.getElementById('status2List');
    const status3List = document.getElementById('status3List');
    
    // 清空所有列表
    status1List.innerHTML = '';
    status2List.innerHTML = '';
    status3List.innerHTML = '';
    
    // 从Supabase数据库获取数据
    try {
        // 创建SupabaseAPI实例
        const supabaseAPI = new SupabaseAPI();
        
        // 获取所有玩家数据
        supabaseAPI.getAllPlayers()
            .then(function(players) {
                // 创建不同状态的玩家数组
                const status1Players = [];
                const status2Players = [];
                const status3Players = [];
                
                // 如果没有数据
                if (!players || players.length === 0) {
                    status1List.innerHTML = '<li class="no-data">暂无数据</li>';
                    status2List.innerHTML = '<li class="no-data">暂无数据</li>';
                    status3List.innerHTML = '<li class="no-data">暂无数据</li>';
                    return;
                }
                
                // 遍历所有玩家数据，按状态分类
                players.forEach(function(player) {
                    // 根据状态分类
                    switch (player.status) {
                        case '魔潮帮帮！':
                            status1Players.push(player);
                            break;
                        case '来我家园玩~':
                            status2Players.push(player);
                            break;
                        case '蹲蹲亲友&同好':
                            status3Players.push(player);
                            break;
                    }
                });
                
                // 按时间戳降序排序（最新的在前）
                status1Players.sort((a, b) => b.timestamp - a.timestamp);
                status2Players.sort((a, b) => b.timestamp - a.timestamp);
                status3Players.sort((a, b) => b.timestamp - a.timestamp);
                
                // 渲染各状态的玩家列表
                renderPlayerList(status1List, status1Players);
                renderPlayerList(status2List, status2Players);
                renderPlayerList(status3List, status3Players);
            })
            .catch(function(error) {
                console.error('获取数据失败:', error);
                status1List.innerHTML = '<li class="no-data">加载失败，请稍后重试</li>';
                status2List.innerHTML = '<li class="no-data">加载失败，请稍后重试</li>';
                status3List.innerHTML = '<li class="no-data">加载失败，请稍后重试</li>';
            });
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        status1List.innerHTML = '<li class="no-data">系统初始化失败，请稍后重试</li>';
        status2List.innerHTML = '<li class="no-data">系统初始化失败，请稍后重试</li>';
        status3List.innerHTML = '<li class="no-data">系统初始化失败，请稍后重试</li>';
    }
    
    // 渲染玩家列表函数
    function renderPlayerList(listElement, players) {
        // 如果该状态下没有玩家
        if (players.length === 0) {
            listElement.innerHTML = '<li class="no-data">暂无数据</li>';
            return;
        }
        
        // 创建玩家列表项
        players.forEach(function(player) {
            const listItem = document.createElement('li');
            listItem.className = 'player-item';
            
            // 格式化时间戳为相对时间
            const relativeTime = formatRelativeTime(player.timestamp);
            
            // 设置列表项内容
            listItem.innerHTML = `
                <div class="player-info">
                    <span class="player-id">${player.gameId}</span>
                    <span class="player-nickname">(${player.nickname})</span>
                </div>
                <div class="player-time">${relativeTime}</div>
            `;
            
            // 添加点击复制效果
            listItem.addEventListener('click', function() {
                copyToClipboard(player.gameId);
            });
            
            // 添加到列表中
            listElement.appendChild(listItem);
        });
    }
    
    /**
     * 格式化时间戳为相对时间
     * @param {number} timestamp 时间戳
     * @returns {string} 相对时间字符串
     */
    function formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        
        // 计算分钟
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 60) {
            return minutes + '分钟前';
        }
        
        // 计算小时
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) {
            return hours + '小时前';
        }
        
        // 计算天数
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days < 7) {
            return days + '天前';
        }
        
        // 超过7天的显示具体日期
        const date = new Date(timestamp);
        return (date.getMonth() + 1) + '/' + date.getDate();
    }
    
    /**
     * 复制文本到剪贴板
     */
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(function() {
                    alert('游戏ID已复制到剪贴板');
                })
                .catch(function() {
                    fallbackCopyToClipboard(text);
                });
        } else {
            fallbackCopyToClipboard(text);
        }
    }
    
    /**
     * 复制文本到剪贴板的后备方法
     */
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('游戏ID已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
    }
});