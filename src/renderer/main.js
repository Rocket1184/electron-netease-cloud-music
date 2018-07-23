import Vue from 'vue';
import Router from 'vue-router';
import MuseUI from 'muse-ui';
import * as Colors from 'muse-ui/lib/theme/colors';
import 'muse-ui/dist/muse-ui.css';
import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';

import App from './App.vue';
import store from './vuex/store';
import routes from './routes';

MuseUI.theme.add('purple', {
    primary: Colors.deepPurple400,
    secondary: Colors.pinkA200
}).use('purple');

Vue.use(Router);
Vue.use(MuseUI);
Vue.use(Toast);
Vue.use(Message);

new Vue({
    store,
    router: new Router({ routes }),
    render: h => h(App)
}).$mount(window.app);
