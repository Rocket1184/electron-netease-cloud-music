export default [
    {
        path: '/',
        name: 'index',
        component: require('./page/index')
    },
    {
        path: '/song/:id',
        name: 'song',
        component: resolve => require(['./page/song'], resolve)
    }
];
