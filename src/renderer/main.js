import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

import App from './App';
import store from './vuex/store';
import routes from './routes';
import Toast from './util/toast';

Vue.use(Router);
Vue.use(MuseUI);
Vue.config.debug = true;
// the 'Toast' uses mu-toast inside,
// so it must be installed after MuseUI
Vue.use(Toast);

const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    ...App
});
