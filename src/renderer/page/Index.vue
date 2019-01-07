<template>
    <div class="index-wrapper">
        <RecommendSongs></RecommendSongs>
    </div>
</template>

<script>
import RecommendSongs from '@/components/RecommendSongs.vue';

export default {
    name: 'page-index',
    components: {
        RecommendSongs
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
