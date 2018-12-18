<template>
    <div class="index-wrapper">
        <recommendSongs></recommendSongs>
    </div>
</template>

<script>
import recommendSongs from '@/components/recommendSongs.vue';

export default {
    name: 'page-index',
    components: {
        recommendSongs
    }
};
</script>

<style lang="less">
.index-wrapper {
    padding: 2em 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
