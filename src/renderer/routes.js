export default [
    {
        path: '/',
        title: '个性推荐',
        component: require('./page/index').default,
        icon: 'polymer'
    },
    {
        path: '/search',
        title: '搜索结果',
        component: require('./page/search').default,
        icon: 'search'
    },
    {
        path: '/player',
        component: require('./page/player').default
    },
    {
        path: '/playlist',
        title: '我的歌单',
        component: require('./page/playlist').default,
        icon: 'library_music'
    },
    {
        path: '/settings',
        title: '应用设置',
        component: require('./page/settings').default,
        icon: 'settings'
    }
];
