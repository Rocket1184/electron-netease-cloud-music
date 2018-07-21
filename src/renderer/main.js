import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

import App from './App.vue';
import store from './vuex/store';
import routes from './routes';
import Toast from './util/toast';
import Prompt from './util/prompt';

Vue.use(Router);
Vue.use(MuseUI);
// the 'Toast' uses mu-toast inside,
// so it must be installed after MuseUI
Vue.use(Toast);
Vue.use(Prompt);

const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
});

/* eslint-disable no-new */
new Vue({
    store,
    router,
    render: (h) => h(App)
}).$mount(window.app);
