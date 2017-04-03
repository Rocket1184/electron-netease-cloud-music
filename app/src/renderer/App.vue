<template>
    <div id="app">
        <appNav/>
        <div class="router-view">
            <router-view/>
        </div>
        <playerBar/>
    </div>
</template>

<script>
import store from 'renderer/vuex/store';
import appNav from './components/appnav';
import playerBar from './components/playerbar';

export default {
    store,
    components: {
        appNav,
        playerBar
    }
};
</script>

<style>
* {
    margin: 0;
    padding: 0;
}

html,
body,
#app {
    height: 100%;
    overflow: hidden;
}

.router-view {
    height: calc(100% - 128px);
    overflow: auto;
}
</style>
