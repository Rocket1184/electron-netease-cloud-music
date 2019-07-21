import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';
import { RecycleScroller } from 'vue-virtual-scroller';

import App from './App.vue';
import store from './store';
import routes from './routes';
import { isLinux } from './util/globals';
import { initTheme } from './util/theme';
import DblclickRipple from './util/dblclick-ripple';
import './style.css';
import './transition.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
Vue.component('RecycleScroller', RecycleScroller);

const el = document.createElement('div');
document.body.appendChild(el);

const app = new Vue({
    store,
    router: new Router({ routes }),
    extends: App
});

store.dispatch('restoreUserInfo');
store.dispatch('restorePlaylist');
store.dispatch('restoreRadio');
store.dispatch('restoreUiState');

window.onbeforeunload = () => {
    store.dispatch('storePlaylist');
    store.dispatch('storeUiState');
    store.dispatch('storeRadio');
};

if (isLinux) {
    app.$once('audio-ready', audio => {
        const m = require('@/util/mpris');
        m.injectStore(store);
        m.bindAudioElement(audio);
    });
}

require('@/util/tray').injectStore(store);

app.$mount(el);
