export default [
    {
        path: '/',
        name: 'index',
        component: require('./page/index')
    },
    {
        path: '/player',
        name: 'player',
        component: require('./page/player')
    },
    {
        path: '/myplaylist',
        name: 'myplaylist',
        component: require('./page/myplaylist')
    },
    {
        path: '/settings',
        name: 'settings',
        component: require('./page/settings')
    }
];
