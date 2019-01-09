import Index from '@/page/Index/Index.vue';
import Search from '@/page/Search/Search.vue';
import Player from '@/page/Player.vue';
import Playlist from '@/page/Playlist.vue';
import Album from '@/page/Album.vue';
import Settings from '@/page/Settings/Settings.vue';
import Favorite from '@/page/Favorite/Favorite.vue';
import RecommendSongs from '@/page/RecommendSongs.vue';

export default [
    {
        name: 'index',
        path: '/',
        title: '个性推荐',
        component: Index,
        icon: 'polymer'
    },
    {
        name: 'search',
        path: '/search',
        title: '搜索结果',
        component: Search,
        icon: 'search'
    },
    {
        name: 'player',
        path: '/player',
        component: Player
    },
    {
        name: 'favorite',
        path: '/favorite',
        title: '我的收藏',
        component: Favorite,
        icon: 'bookmarks'
    },
    {
        name: 'playlist',
        path: '/playlist/:id',
        component: Playlist,
    },
    {
        name: 'album',
        path: '/album/:id',
        component: Album
    },
    {
        name: 'recommend',
        path: '/recommend',
        title: '每日歌曲推荐',
        component: RecommendSongs
    },
    {
        name: 'settings',
        path: '/settings',
        title: '应用设置',
        component: Settings,
        icon: 'settings'
    }
];
