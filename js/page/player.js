// 核心音乐播放器逻辑

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.isPlaying = false;
        this.currentSong = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 0.7;
        this.isLoading = false;
        this.isMuted = false;
        this.previousVolume = 0.7;
        
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
        this.loadPlayerState();
        this.setupKeyboardShortcuts();
    }
    
    setupEventListeners() {
        // 播放/暂停按钮
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // 上一首/下一首按钮
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        // 进度条点击
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量控制
        this.volumeBar.addEventListener('click', (e) => this.setVolume(e));
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // 音频事件监听
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        this.audio.addEventListener('loadstart', () => this.onLoadStart());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        this.audio.addEventListener('waiting', () => this.onWaiting());
        this.audio.addEventListener('playing', () => this.onPlaying());
        this.audio.addEventListener('pause', () => this.onPause());
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
            
            // 保存播放器状态
            this.savePlayerState();
            
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
            isMuted: this.isMuted
        };
        Storage.set('musicPlayer_state', state);
    }
    
    // 加载播放器状态
    loadPlayerState() {
        const state = Storage.get('musicPlayer_state');
        if (state) {
            this.volume = state.volume || 0.7;
            this.isMuted = state.isMuted || false;
            this.audio.volume = this.isMuted ? 0 : this.volume;
            this.updateVolumeDisplay();
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
}

// 创建全局播放器实例
let musicPlayer;

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保所有DOM元素都已加载
    setTimeout(() => {
        musicPlayer = new MusicPlayer();
        console.log('音乐播放器已初始化');
        
        // 确保播放器实例可用
        window.musicPlayer = musicPlayer;
    }, 100);
});

// 导出播放器实例供其他模块使用
window.musicPlayer = musicPlayer;
