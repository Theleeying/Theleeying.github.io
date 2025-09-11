// 公共函数库

// 时间格式化函数
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// DOM操作封装
const $ = {
    // 选择器
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    
    // 创建元素
    create: (tag, className = '', content = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },
    
    // 添加事件监听器
    on: (element, event, handler) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    // 移除事件监听器
    off: (element, event, handler) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    }
};

// 本地存储管理
const Storage = {
    // 保存数据
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },
    
    // 获取数据
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },
    
    // 删除数据
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },
    
    // 清空所有数据
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
};

// 播放历史管理
const PlayHistory = {
    key: 'echoverse_play_history',
    maxItems: 50,
    
    // 添加播放记录
    add: (song) => {
        const history = PlayHistory.getAll();
        const newItem = {
            ...song,
            playedAt: new Date().toISOString()
        };
        
        // 移除重复项
        const filtered = history.filter(item => item.id !== song.id);
        
        // 添加到开头
        filtered.unshift(newItem);
        
        // 限制数量
        if (filtered.length > PlayHistory.maxItems) {
            filtered.splice(PlayHistory.maxItems);
        }
        
        Storage.set(PlayHistory.key, filtered);
    },
    
    // 获取所有播放记录
    getAll: () => {
        return Storage.get(PlayHistory.key, []);
    },
    
    // 清空播放记录
    clear: () => {
        Storage.remove(PlayHistory.key);
    }
};

// 工具函数
const Utils = {
    // 防抖函数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 生成唯一ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 深拷贝
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('EchoVerse 音乐网站已加载');
    
    // 初始化播放历史显示
    const history = PlayHistory.getAll();
    if (history.length > 0) {
        console.log(`加载了 ${history.length} 条播放记录`);
    }
});
