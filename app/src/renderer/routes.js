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
    }
];
