export default [
    {
        path: '/',
        name: '个性推荐',
        component: require('./page/index'),
        icon: 'polymer'
    },
    {
        path: '/search',
        name: '搜索结果',
        component: require('./page/search'),
        icon: 'search'
    },
    {
        path: '/player',
        component: require('./page/player')
    },
    {
        path: '/playlist',
        name: '我的歌单',
        component: require('./page/playlist'),
        icon: 'library_music'
    },
    {
        path: '/settings',
        name: '应用设置',
        component: require('./page/settings'),
        icon: 'settings'
    }
];
