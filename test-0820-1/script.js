/**
 * 主页面脚本
 * 处理表单验证和数据提交到Supabase
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('statusForm');
    const gameIdInput = document.getElementById('gameId');
    const statusSelect = document.getElementById('status');
    const nicknameInput = document.getElementById('nickname');
    
    const gameIdError = document.getElementById('gameIdError');
    const statusError = document.getElementById('statusError');
    const nicknameError = document.getElementById('nicknameError');
    
    // 表单提交事件处理
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 验证表单
        let isValid = true;
        
        // 验证游戏ID - 必须是8位数字
        const gameIdPattern = /^\d{8}$/;
        if (!gameIdPattern.test(gameIdInput.value)) {
            gameIdError.style.display = 'block';
            isValid = false;
        } else {
            gameIdError.style.display = 'none';
        }
        
        // 验证状态选择
        if (statusSelect.value === '') {
            statusError.style.display = 'block';
            isValid = false;
        } else {
            statusError.style.display = 'none';
        }
        
        // 验证昵称
        if (nicknameInput.value.trim() === '') {
            nicknameError.style.display = 'block';
            isValid = false;
        } else {
            nicknameError.style.display = 'none';
        }
        
        // 如果表单验证通过，提交数据到Supabase
        if (isValid) {
            const gameId = gameIdInput.value;
            const status = statusSelect.value;
            const nickname = nicknameInput.value.trim();
            
            try {
                // 创建SupabaseAPI实例
                const supabaseAPI = new SupabaseAPI();
                
                // 提交到Supabase数据库
                supabaseAPI.savePlayerData(gameId, status, nickname)
                    .then(function() {
                        // 显示提交成功消息
                        alert('提交成功！\n游戏ID：' + gameId + '\n状态：' + status + '\n昵称：' + nickname);
                        
                        // 重置表单
                        form.reset();
                    })
                    .catch(function(error) {
                        console.error('提交失败:', error);
                        alert('提交失败，请稍后重试。\n错误信息：' + error.message);
                    });
            } catch (error) {
                console.error('Supabase初始化失败:', error);
                alert('系统初始化失败，请稍后再试');
            }
        }
    });
    
    // 实时表单验证 - 游戏ID
    gameIdInput.addEventListener('input', function() {
        const gameIdPattern = /^\d{0,8}$/;
        if (!gameIdPattern.test(this.value)) {
            // 只允许输入数字，并且不超过8位
            this.value = this.value.replace(/[^\d]/g, '').substring(0, 8);
        }
        
        // 如果输入了8位数字，隐藏错误提示
        if (this.value.length === 8) {
            gameIdError.style.display = 'none';
        }
    });
    
    // 实时表单验证 - 昵称
    nicknameInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            nicknameError.style.display = 'none';
        }
    });
    
    // 实时表单验证 - 状态
    statusSelect.addEventListener('change', function() {
        if (this.value !== '') {
            statusError.style.display = 'none';
        }
    });
});