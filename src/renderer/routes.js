import Index from '@/page/Index/Index.vue';
import Search from '@/page/Search/Search.vue';
import Player from '@/page/Player.vue';
import Playlist from '@/page/Playlist.vue';
import Album from '@/page/Album.vue';
import Artist from '@/page/Artist.vue';
import Video from '@/page/Video.vue';
import User from '@/page/User.vue';
import Profile from '@/page/Profile.vue';
import DjRadio from '@/page/DjRadio.vue';
import Settings from '@/page/Settings/Settings.vue';
import Favorite from '@/page/Favorite/Favorite.vue';
import RecommendSongs from '@/page/RecommendSongs/RecommendSongs.vue';
import Comment from '@/page/Comment/Comment.vue';
import Radio from '@/page/Radio/Radio.vue';
import UnderConstruction from '@/page/UnderConstruction.vue';

/**
 * @typedef {import('vue-router').RouteConfig} R
 * @typedef {{title?: string; icon?: string}} M
 * @typedef { R & M } Route
 * @type {Route[]}
 */
const routes = [
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
        props: true
    },
    {
        name: 'album',
        path: '/album/:id',
        component: Album,
        props: true
    },
    {
        name: 'artist',
        path: '/artist/:id',
        component: Artist,
        props: true
    },
    {
        name: 'video',
        path: '/video/:id',
        component: Video,
        props: true
    },
    {
        name: 'user',
        path: '/user/:id',
        component: User,
        props: true
    },
    {
        name: 'profile',
        path: '/profile',
        component: Profile
    },
    {
        name: 'djradio',
        path: '/djradio/:id',
        component: DjRadio,
        props: true
    },
    {
        name: 'recommend',
        path: '/recommend',
        component: RecommendSongs
    },
    {
        name: 'comment',
        path: '/comment/:type/:id',
        component: Comment,
        props: true
    },
    {
        name: 'radio',
        path: '/radio',
        component: Radio
    },
    {
        name: 'settings',
        path: '/settings',
        title: '应用设置',
        component: Settings,
        icon: 'settings'
    },
    {
        path: '*',
        component: UnderConstruction
    }
];

export default routes;
