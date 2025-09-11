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
            this.currentResults = results;
            this.renderSongList(results);
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
        
        li.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="song-cover" onerror="this.src='assets/images/album-covers/default.jpg'">
            <div class="song-details">
                <h4 class="song-title">${song.title}</h4>
                <p class="song-artist">${song.artist} - ${song.album}</p>
            </div>
            <span class="song-duration">${formatTime(song.duration)}</span>
            <div class="play-icon">▶️</div>
        `;
        
        // 添加点击事件
        li.addEventListener('click', () => this.playSong(song));
        
        return li;
    }
    
    // 播放歌曲
    async playSong(song) {
        if (!window.musicPlayer) {
            console.error('播放器未初始化');
            return;
        }

        try {
            // 如果歌曲没有URL，先获取播放链接
            if (!song.url) {
                this.showLoading();
                const completeSong = await window.songAPI.getCompleteSongInfo(song);
                
                if (completeSong.url) {
                    window.musicPlayer.playSong(completeSong);
                } else {
                    this.showError('无法获取播放链接');
                }
            } else {
                window.musicPlayer.playSong(song);
            }
        } catch (error) {
            console.error('播放歌曲失败:', error);
            this.showError('播放失败，请稍后重试');
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
}

// 页面加载完成后初始化发现页
document.addEventListener('DOMContentLoaded', () => {
    new ExplorePage();
    console.log('发现页已初始化');
});
