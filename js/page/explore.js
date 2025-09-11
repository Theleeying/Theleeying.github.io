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
            // 模拟API调用 - 实际项目中这里会调用真实的音乐API
            const results = await this.searchSongs(query);
            this.currentResults = results;
            this.renderSongList(results);
        } catch (error) {
            console.error('搜索失败:', error);
            this.showError('搜索失败，请稍后重试');
        }
    }
    
    // 模拟搜索API
    async searchSongs(query) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟搜索结果
        const allSongs = this.getMockSongs();
        const filtered = allSongs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.album.toLowerCase().includes(query.toLowerCase())
        );
        
        return filtered;
    }
    
    // 获取模拟歌曲数据
    getMockSongs() {
        return [
            {
                id: '1',
                title: '夜曲',
                artist: '周杰伦',
                album: '十一月的萧邦',
                duration: 240,
                url: 'assets/media/audio/sample1.mp3',
                cover: 'assets/images/album-covers/sample1.jpg'
            },
            {
                id: '2',
                title: '青花瓷',
                artist: '周杰伦',
                album: '我很忙',
                duration: 220,
                url: 'assets/media/audio/sample2.mp3',
                cover: 'assets/images/album-covers/sample2.jpg'
            },
            {
                id: '3',
                title: '稻香',
                artist: '周杰伦',
                album: '魔杰座',
                duration: 200,
                url: 'assets/media/audio/sample3.mp3',
                cover: 'assets/images/album-covers/sample3.jpg'
            },
            {
                id: '4',
                title: '告白气球',
                artist: '周杰伦',
                album: '周杰伦的床边故事',
                duration: 210,
                url: 'assets/media/audio/sample4.mp3',
                cover: 'assets/images/album-covers/sample4.jpg'
            },
            {
                id: '5',
                title: '晴天',
                artist: '周杰伦',
                album: '叶惠美',
                duration: 270,
                url: 'assets/media/audio/sample5.mp3',
                cover: 'assets/images/album-covers/sample5.jpg'
            },
            {
                id: '6',
                title: '七里香',
                artist: '周杰伦',
                album: '七里香',
                duration: 250,
                url: 'assets/media/audio/sample6.mp3',
                cover: 'assets/images/album-covers/sample6.jpg'
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
    playSong(song) {
        if (window.musicPlayer) {
            window.musicPlayer.playSong(song);
        } else {
            console.error('播放器未初始化');
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
