// 导航栏功能
class Navigation {
    constructor() {
        this.init();
    }
    
    init() {
        this.setActiveNavItem();
        this.setupNavClickHandlers();
    }
    
    // 设置当前页面的活动导航项
    setActiveNavItem() {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    // 获取当前页面文件名
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop();
        return page || 'index.html';
    }
    
    // 设置导航点击处理
    setupNavClickHandlers() {
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // 移除所有活动状态
                navLinks.forEach(l => l.classList.remove('active'));
                // 添加当前链接的活动状态
                link.classList.add('active');
                
                // 添加点击效果
                link.style.transform = 'translateY(-2px) scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
        });
    }
}

// 页面加载完成后初始化导航
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});
