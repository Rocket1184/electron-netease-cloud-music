import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';

import App from './App.vue';
import store from './vuex/store';
import routes from './routes';
import DblclickRipple from './util/dblclick-ripple';
import './style.css';
import './transition.css';

const settings = window.__NCM_SETTINGS__;

const node = document.createElement('div');
document.body.appendChild(node);

MuseUI.theme.addCreateTheme((theme) => {
    return `.ncm-page{background-color:${theme.background.default}}
.action-item:hover .mu-icon{color:${theme.background.default}}
.mu-divider{background-color:rgba(0,0,0,.2)}`;
});

MuseUI.theme.add('ncm', {
    primary: settings.themePrimaryColor,
    secondary: settings.themeSecondaryColor
}, settings.themeVariety).use('ncm');

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);
Vue.use(DblclickRipple);

const router = new Router({
    // we an access route stack via `this.$router.history.stack`
    mode: 'abstract',
    routes
});

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount(node);
