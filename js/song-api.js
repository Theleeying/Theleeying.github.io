// 音乐API服务模块 - 接入GD音乐台API

class SongAPI {
    constructor() {
        this.baseURL = 'https://music-api.gdstudio.xyz/api.php';
        this.defaultSource = 'netease';
        this.defaultQuality = '320';
        this.isAvailable = true;
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

            console.log('搜索请求:', `${this.baseURL}?${params}`);
            
            const response = await fetch(`${this.baseURL}?${params}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API响应:', data);
            
            // 处理不同的响应格式
            if (data.code === 200 && data.data) {
                return this.formatSearchResults(data.data);
            } else if (data.code === 200 && Array.isArray(data)) {
                // 有些API可能直接返回数组
                return this.formatSearchResults(data);
            } else if (Array.isArray(data)) {
                // 直接返回数组的情况
                return this.formatSearchResults(data);
            } else {
                throw new Error(data.message || data.msg || '搜索失败');
            }
        } catch (error) {
            console.error('搜索歌曲失败:', error);
            this.isAvailable = false;
            // 返回空数组而不是抛出错误，避免页面崩溃
            return [];
        }
    }

    // 格式化搜索结果
    formatSearchResults(songs) {
        if (!Array.isArray(songs)) {
            console.error('搜索结果不是数组:', songs);
            return [];
        }
        
        return songs.map(song => {
            try {
                return {
                    id: song.id || song.track_id || Math.random().toString(36),
                    title: song.name || song.title || '未知歌曲',
                    artist: Array.isArray(song.artist) ? song.artist.join(', ') : (song.artist || '未知艺术家'),
                    album: song.album || '未知专辑',
                    cover: song.pic_id || song.picId || null,
                    lyricId: song.lyric_id || song.lyricId || song.id,
                    source: song.source || 'netease',
                    // 临时URL，实际播放时需要获取真实URL
                    url: null
                };
            } catch (error) {
                console.error('格式化歌曲信息失败:', song, error);
                return null;
            }
        }).filter(song => song !== null);
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

// 测试API连接
window.songAPI.testConnection = async function() {
    try {
        console.log('测试API连接...');
        const results = await this.searchSongs('测试', 1, 1);
        console.log('API连接测试成功:', results);
        return true;
    } catch (error) {
        console.error('API连接测试失败:', error);
        return false;
    }
};

// 页面加载时测试API连接
document.addEventListener('DOMContentLoaded', async () => {
    const isConnected = await window.songAPI.testConnection();
    if (!isConnected) {
        console.warn('API连接失败，将使用模拟数据');
    }
});
