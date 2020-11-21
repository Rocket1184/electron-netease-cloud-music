import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';
import { RecycleScroller } from 'vue-virtual-scroller/dist/vue-virtual-scroller.esm';

import App from './App.vue';
import store from './store';
import routes from './routes';
import { isLinux } from './util/globals';
import { initTheme, setTheme } from './util/theme';
import DblclickRipple from './util/dblclick-ripple';
import './style.css';
import './transition.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);
Vue.use(DblclickRipple);
Vue.component('RecycleScroller', RecycleScroller);

const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

try {
    const settings = JSON.parse(sessionStorage.getItem('settings'));
    const themeVariety = settings.themeVariety === 'auto'
        ? (darkMediaQuery.matches ? 'dark' : 'light')
        : settings.themeVariety;
    initTheme({
        primary: settings.themePrimaryColor,
        secondary: settings.themeSecondaryColor
    }, themeVariety);
} catch (e) { sessionStorage.removeItem('settings'); }

require('@/util/tray').injectStore(store);

function restoreUserInfoOnline() {
    store.dispatch('restoreUserInfo').catch(e => {
        Message.alert(e.msg, '登录失败');
    });
}

if (navigator.onLine) {
    restoreUserInfoOnline();
} else {
    window.addEventListener('online', () => {
        if (navigator.onLine) {
            restoreUserInfoOnline();
        }
    }, { once: true });
}

store.dispatch('restoreUiState').then(() => {
    Promise.all([
        store.dispatch('restoreRadio'),
        store.dispatch('restorePlaylist')
    ]).then(() => {
        store.dispatch('updateUiTrack');
        if (store.state.settings.autoPlay) {
            store.dispatch('playAudio');
        }
    });
});

window.onbeforeunload = () => {
    store.dispatch('storeCredential');
    store.dispatch('storePlaylist');
    store.dispatch('storeUiState');
    store.dispatch('storeRadio');
};

const router = new Router({ routes });
if (store.state.settings.startupPage !== 'index') {
    router.replace({ name: store.state.settings.startupPage });
}

const app = new Vue({
    store,
    router,
    provide: {
        darkMediaQuery
    },
    extends: App
});

darkMediaQuery.addEventListener('change', e => {
    if (store.state.settings.themeVariety !== 'auto') return;
    const variety = e.matches ? 'dark' : 'light';
    setTheme({
        primary: store.state.settings.themePrimaryColor,
        secondary: store.state.settings.themeSecondaryColor
    }, variety);
});

if (isLinux) {
    app.$once('audio-ready', audio => {
        const m = require('@/util/mpris');
        m.injectStore(store);
        m.bindAudioElement(audio);
    });
}

const el = document.createElement('div');
document.body.appendChild(el);
app.$mount(el);
