// 音乐API服务模块 - 接入GD音乐台API

class SongAPI {
    constructor() {
        this.baseURL = 'https://music-api.gdstudio.xyz/api.php';
        this.defaultSource = 'netease';
        this.defaultQuality = '320';
    }

    // 搜索歌曲
    async searchSongs(keyword, count = 20, page = 1) {
        try {
            const params = new URLSearchParams({
                types: 'search',
                source: this.defaultSource,
                name: keyword,
                count: count.toString(),
                pages: page.toString()
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return this.formatSearchResults(data.data);
            } else {
                throw new Error(data.message || '搜索失败');
            }
        } catch (error) {
            console.error('搜索歌曲失败:', error);
            throw error;
        }
    }

    // 格式化搜索结果
    formatSearchResults(songs) {
        return songs.map(song => ({
            id: song.id,
            title: song.name,
            artist: Array.isArray(song.artist) ? song.artist.join(', ') : song.artist,
            album: song.album,
            cover: song.pic_id,
            lyricId: song.lyric_id,
            source: song.source,
            // 临时URL，实际播放时需要获取真实URL
            url: null
        }));
    }

    // 获取歌曲播放链接
    async getSongURL(trackId, quality = this.defaultQuality) {
        try {
            const params = new URLSearchParams({
                types: 'url',
                source: this.defaultSource,
                id: trackId,
                br: quality
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return {
                    url: data.data.url,
                    quality: data.data.br,
                    size: data.data.size
                };
            } else {
                throw new Error(data.message || '获取播放链接失败');
            }
        } catch (error) {
            console.error('获取歌曲URL失败:', error);
            throw error;
        }
    }

    // 获取专辑封面
    async getAlbumCover(picId, size = '300') {
        try {
            const params = new URLSearchParams({
                types: 'pic',
                source: this.defaultSource,
                id: picId,
                size: size
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return data.data.url;
            } else {
                throw new Error(data.message || '获取专辑封面失败');
            }
        } catch (error) {
            console.error('获取专辑封面失败:', error);
            return null;
        }
    }

    // 获取歌词
    async getLyrics(lyricId) {
        try {
            const params = new URLSearchParams({
                types: 'lyric',
                source: this.defaultSource,
                id: lyricId
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return {
                    original: data.data.lyric,
                    translation: data.data.tlyric
                };
            } else {
                throw new Error(data.message || '获取歌词失败');
            }
        } catch (error) {
            console.error('获取歌词失败:', error);
            return null;
        }
    }

    // 获取完整的歌曲信息（包含URL和封面）
    async getCompleteSongInfo(song) {
        try {
            const [urlData, coverUrl] = await Promise.all([
                this.getSongURL(song.id),
                this.getAlbumCover(song.cover)
            ]);

            return {
                ...song,
                url: urlData.url,
                quality: urlData.quality,
                size: urlData.size,
                cover: coverUrl || 'assets/images/album-covers/default.jpg'
            };
        } catch (error) {
            console.error('获取完整歌曲信息失败:', error);
            return {
                ...song,
                url: null,
                cover: 'assets/images/album-covers/default.jpg'
            };
        }
    }

    // 批量获取歌曲信息
    async getBatchSongInfo(songs) {
        const promises = songs.map(song => this.getCompleteSongInfo(song));
        return Promise.all(promises);
    }
}

// 创建全局API实例
window.songAPI = new SongAPI();
