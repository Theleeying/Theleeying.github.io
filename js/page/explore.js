// 发现页逻辑 - 动态渲染歌曲列表、搜索筛选

class ExplorePage {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.songList = document.getElementById('song-list');
        this.currentResults = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultSongs();
        this.testPlayerConnection();
    }
    
    // 测试播放器连接
    testPlayerConnection() {
        setTimeout(() => {
            if (window.musicPlayer) {
                console.log('播放器连接正常');
            } else {
                console.error('播放器连接失败');
            }
        }, 500);
    }
    
    setupEventListeners() {
        // 搜索按钮点击事件
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // 搜索框回车事件
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 实时搜索（防抖）
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            if (e.target.value.trim()) {
                this.performSearch();
            } else {
                this.loadDefaultSongs();
            }
        }, 500));
    }
    
    // 执行搜索
    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.loadDefaultSongs();
            return;
        }
        
        this.showLoading();
        
        try {
            // 调用真实的音乐API
            const results = await window.songAPI.searchSongs(query, 20, 1);
            
            if (results && results.length > 0) {
                this.currentResults = results;
                this.renderSongList(results);
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this.showError('搜索失败，请稍后重试');
        }
    }
    
    // 获取模拟歌曲数据（作为默认显示）
    getMockSongs() {
        return [
            {
                id: '1',
                title: '夜曲',
                artist: '周杰伦',
                album: '十一月的萧邦',
                duration: 240,
                url: null,
                cover: 'assets/images/album-covers/default.jpg'
            },
            {
                id: '2',
                title: '青花瓷',
                artist: '周杰伦',
                album: '我很忙',
                duration: 220,
                url: null,
                cover: 'assets/images/album-covers/default.jpg'
            },
            {
                id: '3',
                title: '稻香',
                artist: '周杰伦',
                album: '魔杰座',
                duration: 200,
                url: null,
                cover: 'assets/images/album-covers/default.jpg'
            }
        ];
    }
    
    
    // 加载默认歌曲
    loadDefaultSongs() {
        const defaultSongs = this.getMockSongs();
        this.currentResults = defaultSongs;
        this.renderSongList(defaultSongs);
    }
    
    // 渲染歌曲列表
    renderSongList(songs) {
        if (!songs || songs.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.songList.innerHTML = '';
        
        songs.forEach(song => {
            const songItem = this.createSongItem(song);
            this.songList.appendChild(songItem);
        });
    }
    
    // 创建歌曲列表项
    createSongItem(song) {
        const li = $.create('li', 'song-item');
        
        // 处理专辑封面
        let coverSrc = 'assets/images/album-covers/default.jpg';
        if (song.cover) {
            if (typeof song.cover === 'string' && song.cover.startsWith('http')) {
                coverSrc = song.cover;
            } else if (typeof song.cover === 'string') {
                // 如果是pic_id，先显示默认封面，稍后异步加载
                coverSrc = 'assets/images/album-covers/default.jpg';
            }
        }
        
        li.innerHTML = `
            <img src="${coverSrc}" alt="${song.title}" class="song-cover" data-pic-id="${song.cover || ''}">
            <div class="song-details">
                <h4 class="song-title">${song.title}</h4>
                <p class="song-artist">${song.artist} - ${song.album}</p>
            </div>
            <span class="song-duration">${formatTime(song.duration || 0)}</span>
            <div class="play-icon">▶️</div>
        `;
        
        // 添加点击事件
        li.addEventListener('click', () => this.playSong(song));
        
        // 异步加载专辑封面
        this.loadSongCover(li, song.cover);
        
        return li;
    }
    
    // 加载歌曲封面
    async loadSongCover(li, picId) {
        if (!picId || typeof picId !== 'string' || picId.startsWith('http')) {
            return;
        }
        
        try {
            if (window.songAPI && window.songAPI.isAvailable) {
                const coverUrl = await window.songAPI.getAlbumCover(picId);
                if (coverUrl) {
                    const img = li.querySelector('.song-cover');
                    if (img) {
                        // 预加载图片，避免闪烁
                        const newImg = new Image();
                        newImg.onload = () => {
                            img.src = coverUrl;
                        };
                        newImg.onerror = () => {
                            // 保持默认封面
                        };
                        newImg.src = coverUrl;
                    }
                }
            }
        } catch (error) {
            console.error('加载歌曲封面失败:', error);
        }
    }
    
    // 播放歌曲
    async playSong(song) {
        console.log('尝试播放歌曲:', song);
        
        if (!window.musicPlayer) {
            console.error('播放器未初始化');
            this.showError('播放器未初始化');
            return;
        }

        try {
            // 显示播放提示
            this.showToast(`正在加载: ${song.title}`);
            
            // 直接调用播放器的playSong方法，让它处理URL获取
            await window.musicPlayer.playSong(song);
            
            // 播放成功提示
            this.showToast(`开始播放: ${song.title}`, 'success');
            
        } catch (error) {
            console.error('播放歌曲失败:', error);
            this.showError(`播放失败: ${error.message}`);
        }
    }
    
    // 显示加载状态
    showLoading() {
        this.songList.innerHTML = '<li class="loading">正在搜索...</li>';
    }
    
    // 显示空状态
    showEmptyState() {
        this.songList.innerHTML = `
            <li class="empty-state">
                <h4>没有找到相关歌曲</h4>
                <p>请尝试其他关键词或浏览推荐内容</p>
            </li>
        `;
    }
    
    // 显示错误状态
    showError(message) {
        this.songList.innerHTML = `
            <li class="empty-state">
                <h4>出错了</h4>
                <p>${message}</p>
            </li>
        `;
    }
    
    // 显示提示信息
    showToast(message, type = 'info') {
        const toast = $.create('div', 'toast');
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
}

// 页面加载完成后初始化发现页
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保播放器先初始化
    setTimeout(() => {
        new ExplorePage();
        console.log('发现页已初始化');
    }, 200);
});
