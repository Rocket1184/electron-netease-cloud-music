import Index from '@/page/index.vue';
import Search from '@/page/search.vue';
import Player from '@/page/player.vue';
import Playlist from '@/page/playlist.vue';
import Settings from '@/page/settings.vue';
import Favorite from '@/page/favorite.vue';

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
        path: '/settings',
        title: '应用设置',
        component: Settings,
        icon: 'settings'
    }
];
