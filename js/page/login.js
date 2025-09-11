// 登录/注册页面功能

class LoginManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setupPasswordStrength();
        
        // 延迟检查登录状态，确保AuthManager已初始化
        setTimeout(() => {
            if (window.authManager && window.authManager.isLoggedIn()) {
                this.showToast('您已登录，正在跳转...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        }, 200);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 登录表单
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 注册表单
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // 密码强度检测
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }

        // 确认密码验证
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
        }

    }

    // 检查认证状态
    checkAuthStatus() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    }

    // 处理登录
    async handleLogin(e) {
        e.preventDefault();
        console.log('登录表单提交');
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');
        
        console.log('登录信息:', { email, password, rememberMe });

        // 清除之前的错误
        this.clearErrors();

        // 验证输入
        if (!this.validateLoginForm(email, password)) {
            console.log('表单验证失败');
            return;
        }

        // 显示加载状态
        this.setLoadingState('loginBtn', true);
        console.log('开始登录API调用');

        try {
            // 模拟登录API调用
            const result = await this.simulateLogin(email, password);
            console.log('登录API结果:', result);
            
            if (result.success) {
                // 保存用户数据
                this.currentUser = result.user;
                localStorage.setItem('userData', JSON.stringify(result.user));
                
                // 更新全局认证状态
                if (window.authManager) {
                    window.authManager.setUser(result.user);
                }
                
                // 显示成功消息
                this.showToast('登录成功！', 'success');
                
                // 延迟跳转到首页
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showError('emailError', result.message);
            }
        } catch (error) {
            this.showError('emailError', '登录失败，请稍后重试');
        } finally {
            this.setLoadingState('loginBtn', false);
        }
    }

    // 处理注册
    async handleRegister(e) {
        e.preventDefault();
        console.log('注册表单提交');
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        console.log('注册信息:', { username, email, password, confirmPassword });

        // 清除之前的错误
        this.clearErrors();

        // 验证输入
        if (!this.validateRegisterForm(username, email, password, confirmPassword)) {
            console.log('注册表单验证失败');
            return;
        }

        // 显示加载状态
        this.setLoadingState('registerBtn', true);
        console.log('开始注册API调用');

        try {
            // 模拟注册API调用
            const result = await this.simulateRegister(username, email, password);
            console.log('注册API结果:', result);
            
            if (result.success) {
                // 显示成功消息
                this.showToast('注册成功！请登录', 'success');
                
                // 延迟跳转到登录页面
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                this.showError('emailError', result.message);
            }
        } catch (error) {
            this.showError('emailError', '注册失败，请稍后重试');
        } finally {
            this.setLoadingState('registerBtn', false);
        }
    }

    // 验证登录表单
    validateLoginForm(email, password) {
        let isValid = true;

        if (!email) {
            this.showError('emailError', '请输入邮箱地址');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', '请输入有效的邮箱地址');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordError', '请输入密码');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('passwordError', '密码至少需要6位');
            isValid = false;
        }

        return isValid;
    }

    // 验证注册表单
    validateRegisterForm(username, email, password, confirmPassword) {
        let isValid = true;

        if (!username) {
            this.showError('usernameError', '请输入用户名');
            isValid = false;
        } else if (username.length < 3) {
            this.showError('usernameError', '用户名至少需要3位');
            isValid = false;
        }

        if (!email) {
            this.showError('emailError', '请输入邮箱地址');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', '请输入有效的邮箱地址');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordError', '请输入密码');
            isValid = false;
        } else if (password.length < 8) {
            this.showError('passwordError', '密码至少需要8位');
            isValid = false;
        }

        if (!confirmPassword) {
            this.showError('confirmPasswordError', '请确认密码');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('confirmPasswordError', '两次输入的密码不一致');
            isValid = false;
        }

        return isValid;
    }

    // 验证邮箱格式
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 更新密码强度
    updatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!password) {
            strengthFill.style.width = '0%';
            strengthText.textContent = '密码强度';
            return;
        }

        let strength = 0;
        let strengthLabel = '';

        // 长度检查
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // 字符类型检查
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // 设置强度显示
        if (strength <= 2) {
            strengthFill.className = 'strength-fill weak';
            strengthLabel = '弱';
        } else if (strength <= 4) {
            strengthFill.className = 'strength-fill medium';
            strengthLabel = '中等';
        } else {
            strengthFill.className = 'strength-fill strong';
            strengthLabel = '强';
        }

        strengthText.textContent = `密码强度: ${strengthLabel}`;
    }

    // 验证确认密码
    validateConfirmPassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('confirmPasswordError');

        if (confirmPassword && password !== confirmPassword) {
            this.showError('confirmPasswordError', '两次输入的密码不一致');
        } else {
            this.clearError('confirmPasswordError');
        }
    }

    // 设置密码强度检测
    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }
    }


    // 模拟登录API
    async simulateLogin(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // 从localStorage读取用户数据
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    console.log('尝试登录，所有用户:', users);
                    
                    const user = users.find(u => u.email === email && u.password === password);
                    
                    if (user) {
                        console.log('登录成功，用户:', user);
                        resolve({
                            success: true,
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                avatar: user.avatar || 'assets/images/album-covers/default.jpg',
                                joinDate: user.joinDate
                            }
                        });
                    } else {
                        console.log('登录失败，未找到匹配的用户');
                        resolve({
                            success: false,
                            message: '邮箱或密码错误'
                        });
                    }
                } catch (error) {
                    console.error('登录过程中发生错误:', error);
                    resolve({
                        success: false,
                        message: '登录失败，请稍后重试'
                    });
                }
            }, 1000);
        });
    }

    // 模拟注册API
    async simulateRegister(username, email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // 检查用户是否已存在
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const existingUser = users.find(u => u.email === email || u.username === username);
                    
                    if (existingUser) {
                        resolve({
                            success: false,
                            message: '用户名或邮箱已存在'
                        });
                    } else {
                        // 创建新用户
                        const newUser = {
                            id: Date.now().toString(),
                            username,
                            email,
                            password,
                            avatar: 'assets/images/album-covers/default.jpg',
                            joinDate: new Date().toISOString()
                        };
                        
                        users.push(newUser);
                        localStorage.setItem('users', JSON.stringify(users));
                        
                        console.log('用户注册成功:', newUser);
                        console.log('所有用户:', users);
                        
                        resolve({
                            success: true,
                            user: {
                                id: newUser.id,
                                username: newUser.username,
                                email: newUser.email,
                                avatar: newUser.avatar,
                                joinDate: newUser.joinDate
                            }
                        });
                    }
                } catch (error) {
                    console.error('注册过程中发生错误:', error);
                    resolve({
                        success: false,
                        message: '注册失败，请稍后重试'
                    });
                }
            }, 1000);
        });
    }

    // 显示错误
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // 添加错误样式到对应的输入框
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    // 清除错误
    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // 移除错误样式
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    // 清除所有错误
    clearErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        const inputElements = document.querySelectorAll('input');
        inputElements.forEach(element => {
            element.classList.remove('error');
        });
    }

    // 设置加载状态
    setLoadingState(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        const colors = {
            info: 'linear-gradient(135deg, #667eea, #764ba2)',
            error: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            success: 'linear-gradient(135deg, #4caf50, #45a049)'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 更新已登录用户的UI
    updateUIForLoggedInUser() {
        // 如果用户已登录，可以在这里更新UI
        console.log('用户已登录:', this.currentUser);
    }

    // 登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('userData');
        this.showToast('已退出登录', 'info');
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// 创建登录管理器实例
let loginManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保全局AuthManager已准备好
    setTimeout(() => {
        loginManager = new LoginManager();
        console.log('登录页面管理器已初始化');
        
        // 检查是否已登录，如果已登录则跳转到首页
        if (window.authManager && window.authManager.isLoggedIn()) {
            loginManager.showToast('您已登录，正在跳转...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }, 300);
});
