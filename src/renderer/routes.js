import Index from '@/page/Index.vue';
import Search from '@/page/Search/Search.vue';
import Player from '@/page/Player.vue';
import Playlist from '@/page/Playlist.vue';
import Settings from '@/page/Settings/Settings.vue';
import Favorite from '@/page/Favorite/Favorite.vue';
import RecommendSongs from '@/page/RecommendSongs.vue';

export default [
    {
        path: '/',
        title: '个性推荐',
        component: Index,
        icon: 'polymer'
    },
    {
        path: '/search',
        title: '搜索结果',
        component: Search,
        icon: 'search'
    },
    {
        path: '/player',
        component: Player
    },
    {
        path: '/playlist',
        component: Playlist,
    },
    {
        path: '/favorite',
        title: '我的收藏',
        component: Favorite,
        icon: 'bookmarks'
    },
    {
        path: '/playlist/:id',
        component: Playlist,
    },
    {
        path: '/recommend',
        title: '每日歌曲推荐',
        component: RecommendSongs
    },
    {
        path: '/settings',
        title: '应用设置',
        component: Settings,
        icon: 'settings'
    }
];
