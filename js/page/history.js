/**
 * 历史记录页面功能
 * 负责显示用户的播放历史记录
 */
class HistoryManager {
    constructor() {
        this.historyData = [];
        this.filteredData = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.loadHistoryData();
    }

    // 检查认证状态
    checkAuthStatus() {
        if (window.authManager) {
            this.currentUser = window.authManager.getCurrentUser();
            this.updateUI();
        } else {
            // 延迟检查
            setTimeout(() => this.checkAuthStatus(), 100);
        }
    }

    // 更新UI显示
    updateUI() {
        const loginRequired = document.getElementById('loginRequired');
        const historyMain = document.getElementById('historyMain');

        if (this.currentUser) {
            // 用户已登录，显示历史记录
            if (loginRequired) loginRequired.style.display = 'none';
            if (historyMain) historyMain.style.display = 'block';
            this.renderHistory();
        } else {
            // 用户未登录，显示登录提示
            if (loginRequired) loginRequired.style.display = 'flex';
            if (historyMain) historyMain.style.display = 'none';
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 筛选器
        const timeFilter = document.getElementById('timeFilter');
        const sortBy = document.getElementById('sortBy');
        const searchHistory = document.getElementById('searchHistory');

        if (timeFilter) {
            timeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }

        if (searchHistory) {
            searchHistory.addEventListener('input', () => this.applyFilters());
        }

        // 监听存储变化
        window.addEventListener('storage', (e) => {
            if (e.key === 'userData') {
                this.checkAuthStatus();
            }
        });
    }

    // 加载历史数据
    loadHistoryData() {
        if (!this.currentUser) return;

        try {
            const historyKey = `playHistory_${this.currentUser.id}`;
            const historyData = localStorage.getItem(historyKey);
            
            if (historyData) {
                this.historyData = JSON.parse(historyData);
                console.log('加载历史数据:', this.historyData.length, '条记录');
            } else {
                this.historyData = [];
                console.log('没有历史数据');
            }

            this.applyFilters();
            this.updateStats();
        } catch (error) {
            console.error('加载历史数据失败:', error);
            this.historyData = [];
        }
    }

    // 应用筛选和排序
    applyFilters() {
        if (!this.currentUser) return;

        let filtered = [...this.historyData];

        // 时间筛选
        const timeFilter = document.getElementById('timeFilter')?.value || 'all';
        if (timeFilter !== 'all') {
            const now = new Date();
            const filterDate = this.getFilterDate(now, timeFilter);
            
            filtered = filtered.filter(item => {
                const playTime = new Date(item.playTime);
                return playTime >= filterDate;
            });
        }

        // 搜索筛选
        const searchTerm = document.getElementById('searchHistory')?.value?.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.artist.toLowerCase().includes(searchTerm) ||
                item.album.toLowerCase().includes(searchTerm)
            );
        }

        // 排序
        const sortBy = document.getElementById('sortBy')?.value || 'recent';
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.playTime) - new Date(a.playTime);
                case 'frequent':
                    return (b.playCount || 1) - (a.playCount || 1);
                case 'duration':
                    return (b.duration || 0) - (a.duration || 0);
                case 'artist':
                    return a.artist.localeCompare(b.artist);
                default:
                    return 0;
            }
        });

        this.filteredData = filtered;
        this.renderHistory();
    }

    // 获取筛选日期
    getFilterDate(now, filter) {
        const date = new Date(now);
        switch (filter) {
            case 'today':
                date.setHours(0, 0, 0, 0);
                break;
            case 'week':
                date.setDate(date.getDate() - 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() - 1);
                break;
        }
        return date;
    }

    // 渲染历史记录
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');

        if (!historyList) return;

        if (this.filteredData.length === 0) {
            historyList.style.display = 'none';
            if (emptyHistory) emptyHistory.style.display = 'block';
            return;
        }

        historyList.style.display = 'block';
        if (emptyHistory) emptyHistory.style.display = 'none';

        historyList.innerHTML = this.filteredData.map(item => this.createHistoryItem(item)).join('');
    }

    // 创建历史记录项
    createHistoryItem(item) {
        const playTime = new Date(item.playTime);
        const timeStr = this.formatTime(playTime);
        const duration = this.formatDuration(item.duration || 0);
        const playCount = item.playCount || 1;

        return `
            <div class="history-item" data-song-id="${item.id}">
                <img src="${item.cover || 'assets/images/album-covers/default.jpg'}" 
                     alt="${item.title}" 
                     class="history-cover"
                     onerror="this.src='assets/images/album-covers/default.jpg'">
                <div class="history-info">
                    <div class="history-title">${this.escapeHtml(item.title)}</div>
                    <div class="history-artist">${this.escapeHtml(item.artist)}</div>
                    <div class="history-meta">
                        <span>播放 ${playCount} 次</span>
                        <span>时长 ${duration}</span>
                        <span>${timeStr}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn" onclick="historyManager.playSong('${item.id}')" title="播放">
                        ▶️
                    </button>
                    <button class="history-action-btn" onclick="historyManager.removeFromHistory('${item.id}')" title="删除">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // 播放歌曲
    playSong(songId) {
        const song = this.historyData.find(item => item.id === songId);
        if (song && window.musicPlayer) {
            window.musicPlayer.playSong(song);
            this.showToast('开始播放', 'success');
        }
    }

    // 从历史记录中删除
    removeFromHistory(songId) {
        if (!this.currentUser) return;

        const index = this.historyData.findIndex(item => item.id === songId);
        if (index !== -1) {
            this.historyData.splice(index, 1);
            this.saveHistoryData();
            this.applyFilters();
            this.updateStats();
            this.showToast('已从历史记录中删除', 'success');
        }
    }

    // 保存历史数据
    saveHistoryData() {
        if (!this.currentUser) return;

        try {
            const historyKey = `playHistory_${this.currentUser.id}`;
            localStorage.setItem(historyKey, JSON.stringify(this.historyData));
        } catch (error) {
            console.error('保存历史数据失败:', error);
        }
    }

    // 更新统计信息
    updateStats() {
        const totalSongs = document.getElementById('totalSongs');
        const totalTime = document.getElementById('totalTime');
        const favoriteArtists = document.getElementById('favoriteArtists');

        if (totalSongs) {
            totalSongs.textContent = this.historyData.length;
        }

        if (totalTime) {
            const totalDuration = this.historyData.reduce((sum, item) => sum + (item.duration || 0), 0);
            totalTime.textContent = this.formatDuration(totalDuration);
        }

        if (favoriteArtists) {
            const artists = new Set(this.historyData.map(item => item.artist));
            favoriteArtists.textContent = artists.size;
        }
    }

    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    // 格式化时长
    formatDuration(seconds) {
        if (!seconds) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
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

    // 添加播放记录（供播放器调用）
    static addPlayRecord(song, user) {
        if (!user) return;

        try {
            const historyKey = `playHistory_${user.id}`;
            let historyData = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            // 检查是否已存在
            const existingIndex = historyData.findIndex(item => item.id === song.id);
            
            const playRecord = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album || '',
                cover: song.cover,
                duration: song.duration || 0,
                playTime: new Date().toISOString(),
                playCount: 1
            };

            if (existingIndex !== -1) {
                // 更新现有记录
                const existing = historyData[existingIndex];
                existing.playTime = playRecord.playTime;
                existing.playCount = (existing.playCount || 1) + 1;
                existing.duration = song.duration || existing.duration;
            } else {
                // 添加新记录
                historyData.unshift(playRecord);
            }

            // 限制历史记录数量（最多1000条）
            if (historyData.length > 1000) {
                historyData = historyData.slice(0, 1000);
            }

            localStorage.setItem(historyKey, JSON.stringify(historyData));
            console.log('添加播放记录:', playRecord.title);
        } catch (error) {
            console.error('添加播放记录失败:', error);
        }
    }
}

// 创建全局实例
let historyManager;

// 将HistoryManager类暴露到全局
window.HistoryManager = HistoryManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        historyManager = new HistoryManager();
        window.historyManager = historyManager;
        console.log('历史记录管理器已初始化');
        
        // 确保播放器已初始化
        if (window.musicPlayer) {
            console.log('全局播放器已可用');
        } else {
            console.log('等待全局播放器初始化...');
            // 如果播放器还没初始化，等待一下
            setTimeout(() => {
                if (window.musicPlayer) {
                    console.log('全局播放器已可用（延迟）');
                } else {
                    console.warn('全局播放器仍未初始化');
                }
            }, 1000);
        }
    }, 500);
});
