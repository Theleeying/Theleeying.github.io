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
            console.log('搜索关键词:', keyword);
            
            const response = await fetch(`${this.baseURL}?${params}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            console.log('响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API响应数据:', data);
            
            // 处理不同的响应格式
            if (data.code === 200 && data.data) {
                const results = this.formatSearchResults(data.data);
                console.log(`搜索 "${keyword}" 返回 ${results.length} 首歌曲`);
                return results;
            } else if (data.code === 200 && Array.isArray(data)) {
                // 有些API可能直接返回数组
                const results = this.formatSearchResults(data);
                console.log(`搜索 "${keyword}" 返回 ${results.length} 首歌曲`);
                return results;
            } else if (Array.isArray(data)) {
                // 直接返回数组的情况
                const results = this.formatSearchResults(data);
                console.log(`搜索 "${keyword}" 返回 ${results.length} 首歌曲`);
                return results;
            } else {
                console.warn('搜索响应格式异常:', data);
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

            const url = `${this.baseURL}?${params}`;
            console.log('获取播放链接请求:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            console.log('播放链接响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('播放链接响应数据:', data);
            
            // 处理不同的响应格式
            if (data.url) {
                // 直接返回URL的情况（当前API格式）
                return {
                    url: data.url,
                    quality: data.br || quality,
                    size: data.size
                };
            } else if (data.code === 200 && data.data) {
                // 嵌套data的情况
                return {
                    url: data.data.url,
                    quality: data.data.br,
                    size: data.data.size
                };
            } else if (data.code === 200 && data.url) {
                // 直接返回URL的情况
                return {
                    url: data.url,
                    quality: data.br || quality,
                    size: data.size
                };
            } else {
                throw new Error(data.message || data.msg || '获取播放链接失败');
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

            const url = `${this.baseURL}?${params}`;
            console.log('获取专辑封面请求:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            console.log('专辑封面响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('专辑封面响应数据:', data);
            
            // 处理不同的响应格式
            if (data.url) {
                // 直接返回URL的情况（当前API格式）
                return data.url;
            } else if (data.code === 200 && data.data) {
                // 嵌套data的情况
                return data.data.url;
            } else if (data.code === 200 && data.url) {
                // 直接返回URL的情况
                return data.url;
            } else {
                throw new Error(data.message || data.msg || '获取专辑封面失败');
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
            console.log('获取完整歌曲信息:', song);
            
            // 分别获取URL和封面，避免一个失败影响另一个
            let urlData = null;
            let coverUrl = null;
            
            try {
                urlData = await this.getSongURL(song.id);
                console.log('获取到播放链接:', urlData);
            } catch (error) {
                console.error('获取播放链接失败:', error);
            }
            
            try {
                if (song.cover && typeof song.cover === 'string' && !song.cover.startsWith('http')) {
                    coverUrl = await this.getAlbumCover(song.cover);
                    console.log('获取到专辑封面:', coverUrl);
                }
            } catch (error) {
                console.error('获取专辑封面失败:', error);
            }

            const result = {
                ...song,
                url: urlData ? urlData.url : null,
                quality: urlData ? urlData.quality : null,
                size: urlData ? urlData.size : null,
                cover: coverUrl || 'assets/images/album-covers/default.jpg'
            };
            
            console.log('完整歌曲信息结果:', result);
            return result;
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
    
    // 获取推荐歌单
    async getPlaylists(category = '流行', limit = 10) {
        try {
            console.log(`获取${category}歌单，数量: ${limit}`);
            
            // 根据分类搜索相关歌曲
            const songs = await this.searchSongs(category, limit * 3); // 获取更多歌曲用于分组
            
            if (!songs || songs.length === 0) {
                console.log(`未找到${category}相关歌曲`);
                return [];
            }
            
            // 将歌曲分组创建歌单
            const playlists = [];
            const songsPerPlaylist = Math.ceil(songs.length / limit);
            
            for (let i = 0; i < limit && i * songsPerPlaylist < songs.length; i++) {
                const startIndex = i * songsPerPlaylist;
                const endIndex = Math.min(startIndex + songsPerPlaylist, songs.length);
                const playlistSongs = songs.slice(startIndex, endIndex);
                
                if (playlistSongs.length > 0) {
                    const playlist = {
                        id: `playlist-${category}-${i + 1}`,
                        title: `${category}精选 ${i + 1}`,
                        description: `精选${category}音乐，共${playlistSongs.length}首歌曲`,
                        cover: playlistSongs[0].cover || 'assets/images/album-covers/default.jpg',
                        songCount: playlistSongs.length,
                        duration: this.calculateTotalDuration(playlistSongs),
                        songs: playlistSongs,
                        category: category
                    };
                    playlists.push(playlist);
                }
            }
            
            console.log(`成功创建${playlists.length}个${category}歌单`);
            return playlists;
        } catch (error) {
            console.error('获取歌单失败:', error);
            return [];
        }
    }
    
    // 计算歌单总时长
    calculateTotalDuration(songs) {
        // 假设每首歌平均3-4分钟
        const totalMinutes = songs.length * 3.5;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }
    
    // 获取热门歌单分类
    getPlaylistCategories() {
        return [
            { name: '流行', keyword: '流行' },
            { name: '摇滚', keyword: '摇滚' },
            { name: '民谣', keyword: '民谣' },
            { name: '电子', keyword: '电子音乐' },
            { name: 'R&B', keyword: 'R&B' },
            { name: '说唱', keyword: '说唱' },
            { name: '古风', keyword: '古风' },
            { name: '轻音乐', keyword: '轻音乐' },
            { name: '经典', keyword: '经典老歌' },
            { name: '欧美', keyword: '欧美流行' }
        ];
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
