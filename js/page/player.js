// 核心音乐播放器逻辑

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.isPlaying = false;
        this.currentSong = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 0.7;
        
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
        if (!song) {
            console.error('无效的歌曲信息');
            return;
        }
        
        try {
            // 如果歌曲没有URL，尝试获取
            if (!song.url) {
                console.log('歌曲没有URL，尝试获取播放链接...');
                if (window.songAPI) {
                    const completeSong = await window.songAPI.getCompleteSongInfo(song);
                    if (completeSong.url) {
                        song = completeSong;
                    } else {
                        throw new Error('无法获取播放链接');
                    }
                } else {
                    throw new Error('API服务不可用');
                }
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
            
            await this.play();
        } catch (error) {
            console.error('播放歌曲失败:', error);
            this.handleError(error);
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
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            this.volumeBtn.textContent = '🔇';
        } else {
            this.audio.volume = this.volume;
            this.volumeBtn.textContent = '🔊';
        }
        this.updateVolumeDisplay();
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
        
        if (this.audio.volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (this.audio.volume < 0.5) {
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
        
        if (this.currentSong.cover) {
            this.albumCover.src = this.currentSong.cover;
            this.albumCover.alt = `${this.currentSong.title} - 专辑封面`;
        }
    }
    
    // 更新播放历史
    updatePlayHistory() {
        if (this.currentSong) {
            PlayHistory.add(this.currentSong);
        }
    }
    
    // 错误处理
    handleError(error) {
        console.error('播放器错误:', error);
        this.pause();
        
        // 可以在这里添加用户友好的错误提示
        this.songTitle.textContent = '播放出错';
        this.artistName.textContent = '请检查网络连接或文件路径';
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
            currentIndex: this.currentIndex
        };
    }
}

// 创建全局播放器实例
let musicPlayer;

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
    console.log('音乐播放器已初始化');
});

// 导出播放器实例供其他模块使用
window.musicPlayer = musicPlayer;
