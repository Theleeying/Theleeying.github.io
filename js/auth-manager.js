/**
 * 用户认证状态管理器
 * 负责管理登录状态、用户信息显示和退出登录功能
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        // 直接初始化，因为现在在DOMContentLoaded中创建实例
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    // 检查认证状态
    checkAuthStatus() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
                console.log('用户已登录:', this.currentUser);
            } catch (error) {
                console.error('解析用户数据失败:', error);
                this.logout();
            }
        } else {
            this.currentUser = null;
            this.updateUI();
        }
    }

    // 更新UI显示
    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const userMenu = document.getElementById('userMenu');
        const userInfo = document.getElementById('userInfo');
        const historyLink = document.getElementById('historyLink');

        if (this.currentUser) {
            // 用户已登录，显示用户菜单和历史记录链接
            if (loginLink) loginLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (historyLink) historyLink.style.display = 'inline-block';
            if (userInfo) {
                userInfo.textContent = `欢迎，${this.currentUser.username}`;
            }
        } else {
            // 用户未登录，显示登录链接，隐藏历史记录链接
            if (loginLink) loginLink.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
            if (historyLink) historyLink.style.display = 'none';
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // 监听存储变化，同步多标签页状态
        window.addEventListener('storage', (e) => {
            if (e.key === 'userData') {
                this.checkAuthStatus();
            }
        });
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('userData');
        this.updateUI();
        this.showToast('已退出登录', 'success');
        
        // 如果当前在登录页面，刷新页面
        if (window.location.pathname.includes('login.html')) {
            window.location.reload();
        }
        
        console.log('用户已退出登录');
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // 根据类型设置背景色
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        // 添加到页面
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 设置用户数据（登录成功后调用）
    setUser(userData) {
        this.currentUser = userData;
        localStorage.setItem('userData', JSON.stringify(userData));
        this.updateUI();
    }
}

// 延迟创建全局实例，确保DOM已准备好
document.addEventListener('DOMContentLoaded', () => {
    if (!window.authManager) {
        window.authManager = new AuthManager();
        console.log('AuthManager 已初始化');
    }
});
