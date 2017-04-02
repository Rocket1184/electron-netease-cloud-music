<template>
    <div id="#app">
        <appNav/>
        <router-view></router-view>
    </div>
</template>

<script>
import store from 'renderer/vuex/store';
import appNav from './components/appnav';

export default {
    store,
    components: {
        appNav
    }
};
</script>

<style>
* {
    margin: 0;
    padding: 0;
}

html,
body {
    height: 100%;
}
</style>
