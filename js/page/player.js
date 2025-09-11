// 核心音乐播放器逻辑

class MusicPlayer {
    constructor() {
        // 使用当前页面的音频元素
        this.audio = document.getElementById('audio-player');
        if (!this.audio) {
            console.error('未找到音频元素');
            return;
        }
        
        // 初始化状态
        this.isPlaying = false;
        this.currentSong = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 0.7;
        this.isLoading = false;
        this.isMuted = false;
        this.previousVolume = 0.7;
        this.lastSaveTime = 0;
        
        // 歌词相关
        this.currentLyrics = null;
        this.lyricsLines = [];
        this.currentLyricIndex = -1;
        this.lyricsModal = null;
        
        this.bindDOMElements();
        this.init();
    }
    
    bindDOMElements() {
        // DOM元素
        this.playBtn = document.querySelector('.play-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
        this.currentTimeEl = document.querySelector('.current-time');
        this.totalTimeEl = document.querySelector('.total-time');
        this.volumeBtn = document.querySelector('.volume-btn');
        this.volumeBar = document.querySelector('.volume-bar');
        this.volumeFill = document.querySelector('.volume-fill');
        this.songTitle = document.querySelector('.song-title');
        this.artistName = document.querySelector('.artist-name');
        this.albumCover = document.querySelector('.album-cover');
        
        // 调试信息
        console.log('绑定DOM元素:', {
            playBtn: !!this.playBtn,
            albumCover: !!this.albumCover,
            songTitle: !!this.songTitle
        });
    }
    
    init() {
        this.setupEventListeners();
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
        this.loadPlayerState();
        this.setupKeyboardShortcuts();
        this.setupPageVisibilityHandler();
        
        // 检查是否有正在播放的歌曲需要恢复
        this.restorePlaybackState();
    }
    
    // 恢复播放状态
    async restorePlaybackState() {
        try {
            const savedState = localStorage.getItem('musicPlayerState');
            if (savedState) {
                const state = JSON.parse(savedState);
                console.log('恢复播放状态:', state);
                
                if (state.currentSong) {
                    // 恢复歌曲信息（无论是否正在播放）
                    this.currentSong = state.currentSong;
                    this.playlist = state.playlist || [];
                    this.currentIndex = state.currentIndex || 0;
                    this.volume = state.volume || 0.7;
                    this.isMuted = state.isMuted || false;
                    
                    // 设置音频源
                    if (state.currentSong.url) {
                        this.audio.src = state.currentSong.url;
                        this.audio.currentTime = state.currentTime || 0;
                        
                        // 根据保存的状态决定是否播放
                        if (state.isPlaying) {
                            try {
                                await this.audio.play();
                                this.isPlaying = true;
                                console.log('成功恢复播放');
                            } catch (error) {
                                console.log('恢复播放失败:', error);
                                this.isPlaying = false;
                            }
                        } else {
                            // 歌曲是暂停状态，不自动播放
                            this.isPlaying = false;
                            console.log('恢复暂停状态');
                        }
                    }
                    
                    // 更新界面
                    this.updateUI();
                    
                    // 重新加载歌词
                    if (this.currentSong && this.currentSong.id) {
                        this.loadLyrics(this.currentSong);
                    }
                }
            }
        } catch (error) {
            console.error('恢复播放状态失败:', error);
        }
    }
    
    // 设置页面可见性处理
    setupPageVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面重新可见时，同步播放器状态
                console.log('页面重新可见，同步播放器状态');
                this.updateUI();
            }
        });
        
        // 页面获得焦点时也同步状态
        window.addEventListener('focus', () => {
            console.log('页面获得焦点，同步播放器状态');
            this.updateUI();
        });
    }
    
    updateUI() {
        console.log('更新播放器UI，当前状态:', {
            isPlaying: this.isPlaying,
            currentSong: this.currentSong?.title,
            currentTime: this.audio?.currentTime,
            duration: this.audio?.duration
        });
        
        // 更新播放按钮状态
        if (this.playBtn) {
            this.playBtn.innerHTML = this.isPlaying ? '⏸' : '▶';
        }
        
        // 更新歌曲信息
        if (this.currentSong) {
            this.updateSongInfo();
        }
        
        // 更新音量显示
        this.updateVolumeDisplay();
        
        // 更新进度条
        if (this.audio && this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            if (this.progressFill) {
                this.progressFill.style.width = `${progress}%`;
            }
            
            // 更新时间显示
            if (this.currentTimeEl) {
                this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
            }
            if (this.totalTimeEl) {
                this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
            }
        }
    }
    
    setupEventListeners() {
        // 移除旧的事件监听器（如果存在）
        this.removeEventListeners();
        
        // 播放/暂停按钮
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // 上一首/下一首按钮
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSong());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSong());
        }
        
        // 进度条点击
        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        }
        
        // 音量控制
        if (this.volumeBar) {
            this.volumeBar.addEventListener('click', (e) => this.setVolume(e));
        }
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // 音频事件监听（只绑定一次）
        if (this.audio && !this.audio.hasAttribute('data-events-bound')) {
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audio.addEventListener('ended', () => this.nextSong());
            this.audio.addEventListener('error', (e) => this.handleError(e));
            this.audio.addEventListener('loadstart', () => this.onLoadStart());
            this.audio.addEventListener('canplay', () => this.onCanPlay());
            this.audio.addEventListener('waiting', () => this.onWaiting());
            this.audio.addEventListener('playing', () => this.onPlaying());
            this.audio.addEventListener('pause', () => this.onPause());
            this.audio.setAttribute('data-events-bound', 'true');
        }
    }
    
    removeEventListeners() {
        // 移除按钮事件监听器
        if (this.playBtn) {
            this.playBtn.replaceWith(this.playBtn.cloneNode(true));
            this.playBtn = document.querySelector('.play-btn');
        }
        if (this.prevBtn) {
            this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
            this.prevBtn = document.querySelector('.prev-btn');
        }
        if (this.nextBtn) {
            this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
            this.nextBtn = document.querySelector('.next-btn');
        }
        if (this.progressBar) {
            this.progressBar.replaceWith(this.progressBar.cloneNode(true));
            this.progressBar = document.querySelector('.progress-bar');
        }
        if (this.volumeBtn) {
            this.volumeBtn.replaceWith(this.volumeBtn.cloneNode(true));
            this.volumeBtn = document.querySelector('.volume-btn');
        }
        if (this.volumeBar) {
            this.volumeBar.replaceWith(this.volumeBar.cloneNode(true));
            this.volumeBar = document.querySelector('.volume-bar');
        }
    }
    
    // 播放/暂停切换
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    // 播放音乐
    async play() {
        if (!this.currentSong) return;
        
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.playBtn.textContent = '⏸️';
            this.updatePlayHistory();
            this.savePlayerState(); // 保存状态
        } catch (error) {
            console.error('播放失败:', error);
            this.handleError(error);
        }
    }
    
    // 暂停音乐
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.textContent = '▶️';
        this.savePlayerState(); // 保存状态
    }
    
    // 播放指定歌曲
    async playSong(song) {
        console.log('播放器收到播放请求:', song);
        
        if (!song) {
            console.error('无效的歌曲信息');
            return;
        }
        
        try {
            this.setLoadingState(true);
            
            // 如果歌曲没有URL，尝试获取
            if (!song.url) {
                console.log('歌曲没有URL，尝试获取播放链接...');
                if (window.songAPI && window.songAPI.isAvailable) {
                    const completeSong = await window.songAPI.getCompleteSongInfo(song);
                    console.log('获取到完整歌曲信息:', completeSong);
                    if (completeSong.url) {
                        song = completeSong;
                    } else {
                        throw new Error('无法获取播放链接');
                    }
                } else {
                    throw new Error('API服务不可用');
                }
            }
            
            console.log('准备播放歌曲URL:', song.url);
            
            // 验证URL是否有效
            if (!this.isValidAudioUrl(song.url)) {
                console.warn('URL验证失败，但继续尝试播放:', song.url);
            }
            
            // 清理之前的歌词状态
            this.clearLyrics();
            
            this.currentSong = song;
            this.audio.src = song.url;
            this.updateSongInfo();
            
            // 添加到播放列表
            if (!this.playlist.find(s => s.id === song.id)) {
                this.playlist.push(song);
                this.currentIndex = this.playlist.length - 1;
            } else {
                this.currentIndex = this.playlist.findIndex(s => s.id === song.id);
            }
            
            // 立即保存播放器状态（包括暂停状态）
            this.savePlayerState();
            
            // 获取歌词
            this.loadLyrics(song);
            
            // 添加到播放历史记录
            this.addToPlayHistory(song);
            
            console.log('开始播放音频...');
            await this.play();
        } catch (error) {
            console.error('播放歌曲失败:', error);
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    // 上一首
    previousSong() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        const song = this.playlist[this.currentIndex];
        this.playSong(song);
    }
    
    // 下一首
    nextSong() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        const song = this.playlist[this.currentIndex];
        this.playSong(song);
    }
    
    // 清理歌词状态
    clearLyrics() {
        this.currentLyrics = null;
        this.lyricsLines = [];
        this.currentLyricIndex = -1;
        this.removeAlbumCoverClick();
        this.hideLyrics();
    }
    
    // 跳转到指定位置
    seekTo(event) {
        if (!this.audio.duration) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.audio.duration;
        
        this.audio.currentTime = newTime;
    }
    
    // 设置音量
    setVolume(event) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        
        this.volume = percentage;
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }
    
    // 静音切换
    toggleMute() {
        if (this.isMuted) {
            // 取消静音
            this.audio.volume = this.previousVolume;
            this.volume = this.previousVolume;
            this.isMuted = false;
        } else {
            // 静音
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
        }
        this.updateVolumeDisplay();
        this.savePlayerState();
    }
    
    // 更新进度条
    updateProgress() {
        if (!this.audio.duration) return;
        
        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.currentTimeEl.textContent = formatTime(this.audio.currentTime);
        
        // 每5秒保存一次状态（避免过于频繁）
        if (!this.lastSaveTime || Date.now() - this.lastSaveTime > 5000) {
            this.savePlayerState();
            this.lastSaveTime = Date.now();
        }
    }
    
    // 更新总时长
    updateDuration() {
        this.totalTimeEl.textContent = formatTime(this.audio.duration);
    }
    
    // 更新音量显示
    updateVolumeDisplay() {
        const percentage = this.audio.volume * 100;
        this.volumeFill.style.width = `${percentage}%`;
        
        if (this.isMuted || this.audio.volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (this.audio.volume < 0.3) {
            this.volumeBtn.textContent = '🔈';
        } else if (this.audio.volume < 0.7) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }
    
    // 更新歌曲信息显示
    updateSongInfo() {
        if (!this.currentSong) return;
        
        this.songTitle.textContent = this.currentSong.title || '未知歌曲';
        this.artistName.textContent = this.currentSong.artist || '未知艺术家';
        
        // 处理专辑封面
        if (this.currentSong.cover) {
            // 如果是pic_id，需要通过API获取真实封面
            if (typeof this.currentSong.cover === 'string' && !this.currentSong.cover.startsWith('http')) {
                this.loadAlbumCover(this.currentSong.cover);
            } else {
                this.albumCover.src = this.currentSong.cover;
                this.albumCover.alt = `${this.currentSong.title} - 专辑封面`;
            }
        } else {
            this.albumCover.src = 'assets/images/album-covers/default.jpg';
            this.albumCover.alt = '默认封面';
        }
        
        // 添加封面加载错误处理
        this.albumCover.onerror = () => {
            this.albumCover.src = 'assets/images/album-covers/default.jpg';
        };
    }
    
    // 加载专辑封面
    async loadAlbumCover(picId) {
        try {
            if (window.songAPI && window.songAPI.isAvailable) {
                const coverUrl = await window.songAPI.getAlbumCover(picId);
                if (coverUrl) {
                    // 预加载图片，避免闪烁
                    const img = new Image();
                    img.onload = () => {
                        this.albumCover.src = coverUrl;
                        this.albumCover.alt = `${this.currentSong.title} - 专辑封面`;
                    };
                    img.onerror = () => {
                        this.albumCover.src = 'assets/images/album-covers/default.jpg';
                    };
                    img.src = coverUrl;
                } else {
                    this.albumCover.src = 'assets/images/album-covers/default.jpg';
                }
            } else {
                this.albumCover.src = 'assets/images/album-covers/default.jpg';
            }
        } catch (error) {
            console.error('加载专辑封面失败:', error);
            this.albumCover.src = 'assets/images/album-covers/default.jpg';
        }
    }
    
    // 更新播放历史
    updatePlayHistory() {
        if (this.currentSong) {
            PlayHistory.add(this.currentSong);
        }
    }
    
    // 设置加载状态
    setLoadingState(loading) {
        this.isLoading = loading;
        if (loading) {
            this.playBtn.textContent = '⏳';
            this.playBtn.disabled = true;
        } else {
            this.playBtn.disabled = false;
            this.playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
    }
    
    // 验证音频URL
    isValidAudioUrl(url) {
        if (!url) return false;
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
        return audioExtensions.some(ext => url.toLowerCase().includes(ext)) || 
               url.includes('music.') || 
               url.includes('audio');
    }
    
    // 音频事件处理
    onLoadStart() {
        console.log('开始加载音频...');
        this.setLoadingState(true);
    }
    
    onCanPlay() {
        console.log('音频可以播放');
        this.setLoadingState(false);
    }
    
    onWaiting() {
        console.log('音频缓冲中...');
        this.setLoadingState(true);
    }
    
    onPlaying() {
        console.log('音频开始播放');
        this.isPlaying = true;
        this.setLoadingState(false);
    }
    
    onPause() {
        console.log('音频暂停');
        this.isPlaying = false;
        this.setLoadingState(false);
    }
    
    // 错误处理
    handleError(error) {
        console.error('播放器错误:', error);
        this.pause();
        this.setLoadingState(false);
        
        // 用户友好的错误提示
        this.songTitle.textContent = '播放出错';
        this.artistName.textContent = '请检查网络连接或文件路径';
        
        // 显示错误提示
        this.showToast(`播放失败: ${error.message}`, 'error');
    }
    
    // 保存播放器状态
    savePlayerState() {
        const state = {
            currentSong: this.currentSong,
            currentTime: this.audio.currentTime,
            volume: this.audio.volume,
            playlist: this.playlist,
            currentIndex: this.currentIndex,
            isMuted: this.isMuted,
            isPlaying: this.isPlaying
        };
        
        // 使用 localStorage 保存状态
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
        console.log('保存播放器状态:', state);
    }
    
    // 加载播放器状态
    loadPlayerState() {
        try {
            const savedState = localStorage.getItem('musicPlayerState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.volume = state.volume || 0.7;
                this.isMuted = state.isMuted || false;
                this.audio.volume = this.isMuted ? 0 : this.volume;
                this.updateVolumeDisplay();
            }
        } catch (error) {
            console.error('加载播放器状态失败:', error);
        }
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 避免在输入框中触发快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seekToTime(this.audio.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seekToTime(this.audio.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.setVolumeByDelta(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.setVolumeByDelta(-0.1);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyN':
                    e.preventDefault();
                    this.nextSong();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.previousSong();
                    break;
                case 'KeyL':
                    e.preventDefault();
                    this.testLyrics();
                    break;
            }
        });
    }
    
    // 跳转到指定时间
    seekToTime(time) {
        if (this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
        }
    }
    
    // 按增量调整音量
    setVolumeByDelta(delta) {
        const newVolume = Math.max(0, Math.min(1, this.audio.volume + delta));
        this.audio.volume = newVolume;
        this.volume = newVolume;
        this.updateVolumeDisplay();
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
    
    // 加载歌词
    async loadLyrics(song) {
        try {
            if (!song || !song.id) {
                console.log('歌曲没有ID，无法获取歌词');
                this.removeAlbumCoverClick();
                return;
            }
            
            console.log('正在获取歌词:', song.title, 'ID:', song.id);
            
            // 检查API是否可用
            if (!window.songAPI || !window.songAPI.isAvailable) {
                console.log('API服务不可用，跳过歌词加载');
                this.removeAlbumCoverClick();
                return;
            }
            
            const lyrics = await window.songAPI.getLyrics(song.id);
            
            if (lyrics && lyrics.original && lyrics.original.trim()) {
                this.currentLyrics = lyrics;
                this.parseLyrics(lyrics.original);
                console.log('歌词加载成功，行数:', this.lyricsLines.length);
                
                // 设置专辑封面点击事件
                this.setupAlbumCoverClick();
            } else {
                console.log('未找到歌词或歌词为空');
                this.removeAlbumCoverClick();
            }
        } catch (error) {
            console.error('获取歌词失败:', error);
            this.removeAlbumCoverClick();
        }
    }
    
    // 解析歌词
    parseLyrics(lyricsText) {
        this.lyricsLines = [];
        
        if (!lyricsText) return;
        
        const lines = lyricsText.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        
        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3].padEnd(3, '0'));
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = line.replace(timeRegex, '').trim();
                
                if (text) {
                    this.lyricsLines.push({
                        time: time,
                        text: text
                    });
                }
            }
        });
        
        // 按时间排序
        this.lyricsLines.sort((a, b) => a.time - b.time);
        console.log(`解析到 ${this.lyricsLines.length} 行歌词`);
    }
    
    // 设置专辑封面点击事件
    setupAlbumCoverClick() {
        if (this.albumCover) {
            console.log('设置专辑封面点击事件');
            
            // 移除之前的事件监听器（如果存在）
            if (this.albumCoverClickHandler) {
                this.albumCover.removeEventListener('click', this.albumCoverClickHandler);
            }
            
            // 创建新的事件处理函数
            this.albumCoverClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('专辑封面被点击');
                
                if (this.currentLyrics && this.lyricsLines.length > 0) {
                    console.log('打开歌词');
                    this.toggleLyrics();
                } else {
                    console.log('暂无歌词');
                    this.showToast('暂无歌词');
                }
            };
            
            // 添加点击事件
            this.albumCover.addEventListener('click', this.albumCoverClickHandler);
            
            // 添加悬停效果提示
            this.albumCover.style.cursor = 'pointer';
            this.albumCover.title = '点击查看歌词';
            
            // 添加歌词图标覆盖层
            this.addLyricsIcon();
            
            // 添加悬停效果
            this.albumCover.addEventListener('mouseenter', () => {
                this.albumCover.style.transform = 'scale(1.05)';
                this.albumCover.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            });
            
            this.albumCover.addEventListener('mouseleave', () => {
                this.albumCover.style.transform = 'scale(1)';
                this.albumCover.style.boxShadow = 'none';
            });
            
            console.log('专辑封面点击事件设置完成');
        } else {
            console.log('未找到专辑封面元素');
        }
    }
    
    // 添加歌词图标
    addLyricsIcon() {
        // 移除之前的图标
        this.removeLyricsIcon();
        
        // 创建歌词图标
        const lyricsIcon = document.createElement('div');
        lyricsIcon.className = 'lyrics-icon';
        lyricsIcon.innerHTML = '🎵';
        lyricsIcon.style.cssText = `
            position: absolute;
            bottom: -2px;
            right: -2px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border: 2px solid white;
            z-index: 10;
        `;
        
        // 将图标添加到专辑封面的父容器
        const playerInfo = document.querySelector('.player-info');
        if (playerInfo) {
            playerInfo.style.position = 'relative';
            playerInfo.appendChild(lyricsIcon);
        }
    }
    
    // 移除歌词图标
    removeLyricsIcon() {
        const lyricsIcon = document.querySelector('.lyrics-icon');
        if (lyricsIcon) {
            lyricsIcon.remove();
        }
    }
    
    // 移除专辑封面点击事件
    removeAlbumCoverClick() {
        if (this.albumCover && this.albumCoverClickHandler) {
            this.albumCover.removeEventListener('click', this.albumCoverClickHandler);
            this.albumCover.style.cursor = 'default';
            this.albumCover.title = '';
            this.albumCover.style.transform = 'scale(1)';
            this.albumCover.style.boxShadow = 'none';
        }
        
        // 移除歌词图标
        this.removeLyricsIcon();
    }
    
    // 切换歌词显示
    toggleLyrics() {
        if (this.lyricsModal) {
            this.hideLyrics();
        } else {
            this.showLyrics();
        }
    }
    
    // 显示歌词
    showLyrics() {
        if (!this.currentLyrics || this.lyricsLines.length === 0) {
            this.showToast('暂无歌词');
            return;
        }
        
        // 创建歌词模态框
        this.lyricsModal = document.createElement('div');
        this.lyricsModal.className = 'lyrics-modal';
        this.lyricsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // 创建歌词容器
        const lyricsContainer = document.createElement('div');
        lyricsContainer.className = 'lyrics-container';
        lyricsContainer.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            max-height: 80vh;
            width: 90%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
        `;
        
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = this.currentSong ? this.currentSong.title : '歌词';
        title.style.cssText = `
            color: white;
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
        `;
        
        // 创建艺术家
        const artist = document.createElement('p');
        artist.textContent = this.currentSong ? this.currentSong.artist : '';
        artist.style.cssText = `
            color: rgba(255,255,255,0.8);
            margin: 0 0 2rem 0;
            font-size: 1rem;
        `;
        
        // 创建歌词列表
        const lyricsList = document.createElement('div');
        lyricsList.className = 'lyrics-list';
        lyricsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        this.lyricsLines.forEach((line, index) => {
            const lyricLine = document.createElement('div');
            lyricLine.className = 'lyric-line';
            lyricLine.textContent = line.text;
            lyricLine.style.cssText = `
                color: rgba(255,255,255,0.7);
                padding: 0.5rem;
                border-radius: 8px;
                transition: all 0.3s ease;
                font-size: 1rem;
                line-height: 1.5;
            `;
            lyricLine.dataset.index = index;
            lyricsList.appendChild(lyricLine);
        });
        
        // 创建关闭按钮
        const closeBtn = document.createElement('button');
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
        lyricsContainer.appendChild(closeBtn);
        lyricsContainer.appendChild(title);
        lyricsContainer.appendChild(artist);
        lyricsContainer.appendChild(lyricsList);
        this.lyricsModal.appendChild(lyricsContainer);
        
        // 添加到页面
        document.body.appendChild(this.lyricsModal);
        
        // 添加关闭事件
        const closeModal = () => {
            this.hideLyrics();
        };
        
        closeBtn.addEventListener('click', closeModal);
        this.lyricsModal.addEventListener('click', (e) => {
            if (e.target === this.lyricsModal) {
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
        
        // 开始歌词同步
        this.startLyricsSync();
    }
    
    // 隐藏歌词
    hideLyrics() {
        if (this.lyricsModal) {
            this.lyricsModal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (this.lyricsModal && this.lyricsModal.parentNode) {
                    this.lyricsModal.parentNode.removeChild(this.lyricsModal);
                }
                this.lyricsModal = null;
            }, 300);
        }
        this.stopLyricsSync();
    }
    
    // 开始歌词同步
    startLyricsSync() {
        this.lyricsSyncInterval = setInterval(() => {
            this.updateLyricsDisplay();
        }, 100);
    }
    
    // 停止歌词同步
    stopLyricsSync() {
        if (this.lyricsSyncInterval) {
            clearInterval(this.lyricsSyncInterval);
            this.lyricsSyncInterval = null;
        }
    }
    
    // 更新歌词显示
    updateLyricsDisplay() {
        if (!this.lyricsModal || !this.audio || this.lyricsLines.length === 0) return;
        
        const currentTime = this.audio.currentTime;
        let newIndex = -1;
        
        // 找到当前应该高亮的歌词行
        for (let i = 0; i < this.lyricsLines.length; i++) {
            if (this.lyricsLines[i].time <= currentTime) {
                newIndex = i;
            } else {
                break;
            }
        }
        
        // 如果歌词行发生变化，更新显示
        if (newIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = newIndex;
            this.highlightCurrentLyric();
        }
    }
    
    // 高亮当前歌词
    highlightCurrentLyric() {
        const lyricsList = document.querySelector('.lyrics-list');
        if (!lyricsList) return;
        
        const lines = lyricsList.querySelectorAll('.lyric-line');
        
        lines.forEach((line, index) => {
            if (index === this.currentLyricIndex) {
                // 当前行高亮
                line.style.cssText = `
                    color: white;
                    background: rgba(255,255,255,0.2);
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.5;
                    transform: scale(1.05);
                `;
                
                // 滚动到当前行
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // 其他行正常显示
                line.style.cssText = `
                    color: rgba(255,255,255,0.7);
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                    line-height: 1.5;
                    transform: scale(1);
                `;
            }
        });
    }
    
    // 获取当前播放状态
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentSong: this.currentSong,
            currentTime: this.audio.currentTime,
            duration: this.audio.duration,
            volume: this.audio.volume,
            playlist: this.playlist,
            currentIndex: this.currentIndex,
            isLoading: this.isLoading,
            isMuted: this.isMuted
        };
    }
    
    // 手动测试歌词功能
    async testLyrics() {
        if (!this.currentSong) {
            this.showToast('请先播放一首歌曲');
            return;
        }
        
        console.log('手动测试歌词功能');
        await this.loadLyrics(this.currentSong);
        
        if (this.currentLyrics && this.lyricsLines.length > 0) {
            this.showToast(`歌词加载成功，共${this.lyricsLines.length}行`);
            this.setupAlbumCoverClick();
        } else {
            this.showToast('未找到歌词');
        }
    }

    // 添加到播放历史记录
    addToPlayHistory(song) {
        console.log('addToPlayHistory 被调用，歌曲:', song);
        try {
            // 检查是否有登录用户
            const userData = localStorage.getItem('userData');
            console.log('用户数据:', userData ? '存在' : '不存在');
            
            if (userData) {
                const user = JSON.parse(userData);
                console.log('解析用户数据:', user);
                
                // 使用HistoryManager的静态方法添加记录
                if (window.HistoryManager) {
                    console.log('使用 window.HistoryManager.addPlayRecord');
                    window.HistoryManager.addPlayRecord(song, user);
                } else {
                    console.log('window.HistoryManager 不存在，尝试其他方式');
                    // 如果HistoryManager还没加载，直接调用静态方法
                    const HistoryManager = window.HistoryManager || 
                        (window.historyManager && window.historyManager.constructor);
                    if (HistoryManager && HistoryManager.addPlayRecord) {
                        console.log('使用备用方式调用 addPlayRecord');
                        HistoryManager.addPlayRecord(song, user);
                    } else {
                        console.error('无法找到 HistoryManager.addPlayRecord 方法');
                    }
                }
            } else {
                console.log('用户未登录，跳过历史记录');
            }
        } catch (error) {
            console.error('添加播放历史记录失败:', error);
        }
    }
}

// 创建全局播放器实例
let musicPlayer;

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保所有DOM元素都已加载
    setTimeout(() => {
        // 总是创建新的播放器实例，它会自动处理全局状态
        musicPlayer = new MusicPlayer();
        window.musicPlayer = musicPlayer;
        console.log('音乐播放器已初始化');
    }, 100);
});

// 导出播放器实例供其他模块使用
window.musicPlayer = musicPlayer;
