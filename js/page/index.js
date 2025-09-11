// 首页逻辑 - 动态生成推荐歌单和新专速递

class HomePage {
    constructor() {
        this.playlistGrid = document.querySelector('.playlist-grid');
        this.albumGrid = document.querySelector('.album-grid');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.currentCategory = '流行';
        
        this.init();
    }
    
    init() {
        this.setupCategoryButtons();
        this.loadFeaturedPlaylists();
        this.loadNewAlbums();
    }
    
    // 设置分类按钮事件
    setupCategoryButtons() {
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.switchCategory(category);
            });
        });
    }
    
    // 切换歌单分类
    async switchCategory(category) {
        // 更新按钮状态
        this.categoryButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentCategory = category;
        
        // 显示加载状态
        this.showLoadingState();
        
        try {
            // 使用API获取歌单
            const playlists = await window.songAPI.getPlaylists(category, 6);
            this.renderPlaylists(playlists);
        } catch (error) {
            console.error('加载歌单失败:', error);
            this.showErrorState();
        }
    }
    
    // 显示加载状态
    showLoadingState() {
        if (!this.playlistGrid) return;
        
        this.playlistGrid.innerHTML = '';
        
        for (let i = 0; i < 6; i++) {
            const loadingCard = $.create('div', 'playlist-card loading');
            loadingCard.innerHTML = `
                <div class="playlist-cover loading-placeholder"></div>
                <div class="playlist-info">
                    <h4 class="loading-placeholder">加载中...</h4>
                    <p class="loading-placeholder">正在获取${this.currentCategory}歌单</p>
                    <div class="playlist-meta">
                        <span class="loading-placeholder">-- 首歌曲</span>
                        <span class="loading-placeholder">-- 分钟</span>
                    </div>
                </div>
            `;
            this.playlistGrid.appendChild(loadingCard);
        }
    }
    
    // 显示错误状态
    showErrorState() {
        if (!this.playlistGrid) return;
        
        this.playlistGrid.innerHTML = `
            <div class="error-message">
                <h4>加载失败</h4>
                <p>无法获取${this.currentCategory}歌单，请稍后重试</p>
                <button onclick="location.reload()">重新加载</button>
            </div>
        `;
    }
    
    // 加载推荐歌单
    async loadFeaturedPlaylists() {
        try {
            // 使用API获取歌单
            const playlists = await window.songAPI.getPlaylists(this.currentCategory, 6);
            this.renderPlaylists(playlists);
        } catch (error) {
            console.error('加载歌单失败:', error);
            // 降级到静态歌单
            const playlists = this.getFeaturedPlaylists();
            this.renderPlaylists(playlists);
        }
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
                title: '叶惠美',
                artist: '周杰伦',
                year: '2003',
                cover: 'assets/images/artist-avatars/artist1.jpg',
                genre: '流行',
                songCount: 11
            },
            {
                id: 'album-2',
                title: '心中的日月',
                artist: '王力宏',
                year: '2004',
                cover: 'assets/images/artist-avatars/artist2.jpg',
                genre: '流行',
                songCount: 12
            },
            {
                id: 'album-3',
                title: '新的心跳',
                artist: '邓紫棋',
                year: '2015',
                cover: 'assets/images/artist-avatars/artist3.jpg',
                genre: '流行',
                songCount: 10
            },
            {
                id: 'album-4',
                title: '模特',
                artist: '李荣浩',
                year: '2013',
                cover: 'assets/images/artist-avatars/artist4.jpg',
                genre: '流行',
                songCount: 9
            },
            {
                id: 'album-5',
                title: '曹操',
                artist: '林俊杰',
                year: '2006',
                cover: 'assets/images/artist-avatars/artist5.jpg',
                genre: '流行',
                songCount: 11
            },
            {
                id: 'album-6',
                title: '橙月',
                artist: '方大同',
                year: '2008',
                cover: 'assets/images/artist-avatars/artist6.jpg',
                genre: 'R&B',
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
        
        if (playlist.songs && playlist.songs.length > 0) {
            // 显示歌单中的歌曲
            this.showPlaylistSongs(playlist);
        } else {
            this.showToast(`歌单 ${playlist.title} 暂无歌曲`);
        }
    }
    
    // 显示歌单中的歌曲
    showPlaylistSongs(playlist) {
        // 创建模态框
        const modal = $.create('div', 'playlist-songs-modal');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // 创建内容容器
        const content = $.create('div', 'modal-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            max-height: 80vh;
            width: 90%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        // 创建标题
        const title = $.create('h2', 'modal-title');
        title.textContent = playlist.title;
        title.style.cssText = `
            color: white;
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            text-align: center;
        `;
        
        // 创建歌单信息
        const info = $.create('div', 'playlist-info');
        info.innerHTML = `
            <p style="color: rgba(255,255,255,0.8); text-align: center; margin-bottom: 1.5rem;">
                ${playlist.description} • ${playlist.duration}
            </p>
        `;
        
        // 创建歌曲列表
        const songList = $.create('div', 'song-list');
        songList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        
        playlist.songs.forEach((song, index) => {
            const songItem = this.createSongItem(song, index);
            songList.appendChild(songItem);
        });
        
        // 创建关闭按钮
        const closeBtn = $.create('button', 'close-btn');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 组装模态框
        content.appendChild(closeBtn);
        content.appendChild(title);
        content.appendChild(info);
        content.appendChild(songList);
        modal.appendChild(content);
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 添加关闭事件
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC键关闭
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }
    
    // 打开专辑 - 搜索该歌手的歌曲
    async openAlbum(album) {
        console.log('打开专辑:', album.title, '歌手:', album.artist);
        this.showToast(`正在搜索 ${album.artist} 的歌曲...`);
        
        try {
            // 尝试多种搜索策略
            const songs = await this.searchArtistSongs(album.artist);
            
            if (songs && songs.length > 0) {
                console.log(`找到 ${songs.length} 首 ${album.artist} 的歌曲:`, songs);
                
                // 显示搜索结果
                this.showArtistSongs(album.artist, songs);
                
                // 显示成功提示
                this.showToast(`找到 ${songs.length} 首 ${album.artist} 的歌曲`);
            } else {
                console.log(`未找到 ${album.artist} 的歌曲`);
                this.showToast(`未找到 ${album.artist} 的歌曲，请稍后重试`);
            }
        } catch (error) {
            console.error('搜索歌手歌曲失败:', error);
            this.showToast(`搜索失败: ${error.message}`);
        }
    }
    
    // 搜索歌手歌曲的多种策略
    async searchArtistSongs(artist) {
        // 定义搜索关键词列表
        const searchTerms = [
            artist, // 原始名字
            artist + ' 歌曲', // 添加"歌曲"关键词
            artist + ' 热门', // 添加"热门"关键词
        ];
        
        // 如果是特定歌手，添加更多搜索变体
        const artistVariants = {
            '邓紫棋': ['G.E.M.', 'GEM', '邓紫棋 G.E.M.', '邓紫棋 泡沫', '邓紫棋 光年之外'],
            '周杰伦': ['Jay Chou', '周杰伦 青花瓷', '周杰伦 稻香', '周杰伦 告白气球'],
            '王力宏': ['Leehom Wang', '王力宏 龙的传人', '王力宏 大城小爱'],
            '林俊杰': ['JJ Lin', '林俊杰 江南', '林俊杰 一千年以后'],
            '李荣浩': ['李荣浩 模特', '李荣浩 李白', '李荣浩 年少有为'],
            '方大同': ['Khalil Fong', '方大同 爱爱爱', '方大同 三人游']
        };
        
        if (artistVariants[artist]) {
            searchTerms.push(...artistVariants[artist]);
        }
        
        console.log(`尝试搜索关键词:`, searchTerms);
        
        // 依次尝试每个搜索关键词
        for (const term of searchTerms) {
            try {
                console.log(`尝试搜索: "${term}"`);
                const songs = await window.songAPI.searchSongs(term, 20);
                
                if (songs && songs.length > 0) {
                    console.log(`搜索 "${term}" 成功，找到 ${songs.length} 首歌曲`);
                    return songs;
                }
            } catch (error) {
                console.log(`搜索 "${term}" 失败:`, error.message);
                continue;
            }
        }
        
        // 如果所有搜索都失败，返回空数组
        console.log(`所有搜索关键词都未找到结果`);
        return [];
    }
    
    // 显示歌手的歌曲列表
    showArtistSongs(artist, songs) {
        // 创建模态框
        const modal = $.create('div', 'artist-songs-modal');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // 创建内容容器
        const content = $.create('div', 'modal-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            max-height: 80vh;
            width: 90%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        // 创建标题
        const title = $.create('h2', 'modal-title');
        title.textContent = `${artist} 的歌曲`;
        title.style.cssText = `
            color: white;
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
            text-align: center;
        `;
        
        // 创建歌曲列表
        const songList = $.create('div', 'song-list');
        songList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        
        songs.forEach((song, index) => {
            const songItem = this.createSongItem(song, index);
            songList.appendChild(songItem);
        });
        
        // 创建关闭按钮
        const closeBtn = $.create('button', 'close-btn');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 组装模态框
        content.appendChild(closeBtn);
        content.appendChild(title);
        content.appendChild(songList);
        modal.appendChild(content);
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 添加关闭事件
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC键关闭
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }
    
    // 创建歌曲列表项
    createSongItem(song, index) {
        const item = $.create('div', 'song-item');
        item.style.cssText = `
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // 添加悬停效果
        item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(255,255,255,0.2)';
            item.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'rgba(255,255,255,0.1)';
            item.style.transform = 'translateY(0)';
        });
        
        // 专辑封面
        const cover = $.create('img', 'song-cover');
        cover.src = song.cover || 'assets/images/album-covers/default.jpg';
        cover.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 6px;
            object-fit: cover;
        `;
        cover.onerror = () => {
            cover.src = 'assets/images/album-covers/default.jpg';
        };
        
        // 歌曲信息
        const info = $.create('div', 'song-info');
        info.style.cssText = `
            flex: 1;
            color: white;
        `;
        
        const title = $.create('div', 'song-title');
        title.textContent = song.title;
        title.style.cssText = `
            font-weight: 600;
            margin-bottom: 0.25rem;
        `;
        
        const artist = $.create('div', 'song-artist');
        artist.textContent = song.artist;
        artist.style.cssText = `
            font-size: 0.9rem;
            opacity: 0.8;
        `;
        
        info.appendChild(title);
        info.appendChild(artist);
        
        // 播放按钮
        const playBtn = $.create('button', 'play-btn');
        playBtn.innerHTML = '▶';
        playBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        // 添加播放按钮悬停效果
        playBtn.addEventListener('mouseenter', () => {
            playBtn.style.background = 'rgba(255,255,255,0.3)';
            playBtn.style.transform = 'scale(1.1)';
        });
        
        playBtn.addEventListener('mouseleave', () => {
            playBtn.style.background = 'rgba(255,255,255,0.2)';
            playBtn.style.transform = 'scale(1)';
        });
        
        // 组装歌曲项
        item.appendChild(cover);
        item.appendChild(info);
        item.appendChild(playBtn);
        
        // 添加点击播放事件
        const playSong = async () => {
            try {
                this.showToast(`正在播放: ${song.title}`);
                await window.musicPlayer.playSong(song);
            } catch (error) {
                console.error('播放失败:', error);
                this.showToast(`播放失败: ${error.message}`);
            }
        };
        
        item.addEventListener('click', playSong);
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSong();
        });
        
        return item;
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
    // 延迟初始化，确保API和播放器都已准备好
    setTimeout(() => {
        new HomePage();
        console.log('首页已初始化');
    }, 300);
});
