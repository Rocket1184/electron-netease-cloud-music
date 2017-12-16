export default [
    {
        path: '/',
        title: '个性推荐',
        component: require('./page/index.vue').default,
        icon: 'polymer'
    },
    {
        path: '/search',
        title: '搜索结果',
        component: require('./page/search.vue').default,
        icon: 'search'
    },
    {
        path: '/player',
        component: require('./page/player.vue').default
    },
    {
        path: '/playlist',
        title: '我的歌单',
        component: require('./page/playlist.vue').default,
        icon: 'library_music'
    },
    {
        path: '/settings',
        title: '应用设置',
        component: require('./page/settings.vue').default,
        icon: 'settings'
    }
];
