<template>
    <div id="#app">
        <router-view></router-view>
    </div>
</template>

<script>
import store from 'renderer/vuex/store';
export default {
    store
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
