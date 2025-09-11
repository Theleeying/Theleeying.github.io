// 首页逻辑 - 动态生成推荐歌单和新专速递

class HomePage {
    constructor() {
        this.playlistGrid = document.querySelector('.playlist-grid');
        this.albumGrid = document.querySelector('.album-grid');
        
        this.init();
    }
    
    init() {
        this.loadFeaturedPlaylists();
        this.loadNewAlbums();
    }
    
    // 加载推荐歌单
    loadFeaturedPlaylists() {
        const playlists = this.getFeaturedPlaylists();
        this.renderPlaylists(playlists);
    }
    
    // 加载新专速递
    loadNewAlbums() {
        const albums = this.getNewAlbums();
        this.renderAlbums(albums);
    }
    
    // 获取推荐歌单数据
    getFeaturedPlaylists() {
        return [
            {
                id: 'playlist-1',
                title: '经典华语金曲',
                description: '那些年我们一起听过的经典',
                cover: 'assets/images/album-covers/classic-chinese.jpg',
                songCount: 25,
                duration: '1小时32分'
            },
            {
                id: 'playlist-2',
                title: '流行音乐精选',
                description: '当下最热门的流行歌曲',
                cover: 'assets/images/album-covers/pop-music.jpg',
                songCount: 30,
                duration: '1小时45分'
            },
            {
                id: 'playlist-3',
                title: '摇滚经典',
                description: '震撼心灵的摇滚音乐',
                cover: 'assets/images/album-covers/rock-classic.jpg',
                songCount: 20,
                duration: '1小时20分'
            },
            {
                id: 'playlist-4',
                title: '轻音乐放松',
                description: '舒缓身心的轻音乐',
                cover: 'assets/images/album-covers/light-music.jpg',
                songCount: 35,
                duration: '2小时15分'
            },
            {
                id: 'playlist-5',
                title: '电子音乐',
                description: '现代电子音乐精选',
                cover: 'assets/images/album-covers/electronic.jpg',
                songCount: 28,
                duration: '1小时50分'
            },
            {
                id: 'playlist-6',
                title: '民谣故事',
                description: '温暖人心的民谣音乐',
                cover: 'assets/images/album-covers/folk.jpg',
                songCount: 22,
                duration: '1小时25分'
            }
        ];
    }
    
    // 获取新专速递数据
    getNewAlbums() {
        return [
            {
                id: 'album-1',
                title: '十一月的萧邦',
                artist: '周杰伦',
                year: '2005',
                cover: 'assets/images/album-covers/november-chopin.jpg',
                genre: '流行',
                songCount: 12
            },
            {
                id: 'album-2',
                title: '我很忙',
                artist: '周杰伦',
                year: '2007',
                cover: 'assets/images/album-covers/im-busy.jpg',
                genre: '流行',
                songCount: 10
            },
            {
                id: 'album-3',
                title: '魔杰座',
                artist: '周杰伦',
                year: '2008',
                cover: 'assets/images/album-covers/capricorn.jpg',
                genre: '流行',
                songCount: 11
            },
            {
                id: 'album-4',
                title: '周杰伦的床边故事',
                artist: '周杰伦',
                year: '2016',
                cover: 'assets/images/album-covers/bedtime-stories.jpg',
                genre: '流行',
                songCount: 10
            },
            {
                id: 'album-5',
                title: '叶惠美',
                artist: '周杰伦',
                year: '2003',
                cover: 'assets/images/album-covers/ye-huimei.jpg',
                genre: '流行',
                songCount: 11
            },
            {
                id: 'album-6',
                title: '七里香',
                artist: '周杰伦',
                year: '2004',
                cover: 'assets/images/album-covers/qi-li-xiang.jpg',
                genre: '流行',
                songCount: 10
            }
        ];
    }
    
    // 渲染歌单
    renderPlaylists(playlists) {
        if (!this.playlistGrid) return;
        
        this.playlistGrid.innerHTML = '';
        
        playlists.forEach(playlist => {
            const playlistCard = this.createPlaylistCard(playlist);
            this.playlistGrid.appendChild(playlistCard);
        });
    }
    
    // 渲染专辑
    renderAlbums(albums) {
        if (!this.albumGrid) return;
        
        this.albumGrid.innerHTML = '';
        
        albums.forEach(album => {
            const albumCard = this.createAlbumCard(album);
            this.albumGrid.appendChild(albumCard);
        });
    }
    
    // 创建歌单卡片
    createPlaylistCard(playlist) {
        const card = $.create('div', 'playlist-card fade-in');
        
        card.innerHTML = `
            <img src="${playlist.cover}" alt="${playlist.title}" class="playlist-cover" onerror="this.src='assets/images/album-covers/default.jpg'">
            <div class="playlist-info">
                <h4>${playlist.title}</h4>
                <p>${playlist.description}</p>
                <div class="playlist-meta">
                    <span class="song-count">${playlist.songCount} 首歌曲</span>
                    <span class="duration">${playlist.duration}</span>
                </div>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => this.openPlaylist(playlist));
        
        return card;
    }
    
    // 创建专辑卡片
    createAlbumCard(album) {
        const card = $.create('div', 'album-card fade-in');
        
        card.innerHTML = `
            <img src="${album.cover}" alt="${album.title}" class="album-cover" onerror="this.src='assets/images/album-covers/default.jpg'">
            <div class="album-info">
                <h4>${album.title}</h4>
                <p class="artist">${album.artist}</p>
                <div class="album-meta">
                    <span class="year">${album.year}</span>
                    <span class="genre">${album.genre}</span>
                    <span class="song-count">${album.songCount} 首</span>
                </div>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => this.openAlbum(album));
        
        return card;
    }
    
    // 打开歌单
    openPlaylist(playlist) {
        console.log('打开歌单:', playlist.title);
        // 这里可以跳转到歌单详情页或显示歌单内容
        // 暂时显示提示
        this.showToast(`正在加载歌单: ${playlist.title}`);
    }
    
    // 打开专辑
    openAlbum(album) {
        console.log('打开专辑:', album.title);
        // 这里可以跳转到专辑详情页或显示专辑内容
        // 暂时显示提示
        this.showToast(`正在加载专辑: ${album.title}`);
    }
    
    // 显示提示信息
    showToast(message) {
        // 创建提示元素
        const toast = $.create('div', 'toast');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
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

// 页面加载完成后初始化首页
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
    console.log('首页已初始化');
});
