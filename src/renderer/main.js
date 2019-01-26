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

const settings = window.__NCM_SETTINGS__;

initTheme({
    primary: settings.themePrimaryColor,
    secondary: settings.themeSecondaryColor
}, settings.themeVariety);

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);
Vue.use(DblclickRipple);

const node = document.createElement('div');
document.body.appendChild(node);

new Vue({
    store,
    router: new Router({
        // we an access route stack via `this.$router.history.stack`
        mode: 'abstract',
        routes
    }),
    render: h => h(App)
}).$mount(node);
