export default [
    {
        path: '/',
        name: 'index',
        component: require('./page/index')
    },
    {
        path: '/player',
        name: 'player',
        component: resolve => require(['./page/player'], resolve)
    },
    {
        path: '/myplaylist',
        name: 'myplaylist',
        component: resolve => require(['./page/myplaylist'], resolve)
    },
    {
        path: '/settings',
        name: 'settings',
        component: resolve => require(['./page/settings'], resolve)
    }
];
