<template>
    <div class="index-wrapper">
        <dailySuggestions></dailySuggestions>
    </div>
</template>

<script>
import dailySuggestions from '@/components/dailySuggestions.vue';

export default {
    name: 'page-index',
    components: {
        dailySuggestions
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
