import Vue from 'vue';
import Electron from 'vue-electron';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

import App from './App';
import routes from './routes';

Vue.use(Electron);
Vue.use(Router);
Vue.use(MuseUI);
Vue.config.debug = true;

const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    ...App
});
