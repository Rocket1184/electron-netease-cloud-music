import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';

import App from './App.vue';
import store from './vuex/store';
import routes from './routes';
import { initTheme } from './util/theme';
import DblclickRipple from './util/dblclick-ripple';
import './style.css';
import './transition.css';

try {
    const settings = JSON.parse(sessionStorage.getItem('settings'));
    initTheme({
        primary: settings.themePrimaryColor,
        secondary: settings.themeSecondaryColor
    }, settings.themeVariety);
} catch (e) { sessionStorage.removeItem('settings'); }

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);
Vue.use(DblclickRipple);

const el = document.createElement('div');
document.body.appendChild(el);

new Vue({
    el,
    store,
    router: new Router({ routes }),
    ...App
});
