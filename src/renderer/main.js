import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';

import App from './App.vue';
import store from './vuex/store';
import routes from './routes';

const settings = window.__NCM_SETTINGS__;

const node = document.createElement('div');
document.body.appendChild(node);

MuseUI.theme.addCreateTheme((theme) => {
    return `.action-item:hover .mu-icon{color:${theme.background.default};}`;
});

MuseUI.theme.add('ncm', {
    primary: settings.themePrimaryColor,
    secondary: settings.themeSecondaryColor
}, settings.themeVariety).use('ncm');

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);

new Vue({
    store,
    router: new Router({ routes }),
    render: h => h(App)
}).$mount(node);
