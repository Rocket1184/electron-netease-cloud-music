<template>
    <div class="index-wrapper">
        <dailySuggestions/>
    </div>
</template>

<script>
import dailySuggestions from '../components/dailysuggestions';
export default {
    components: {
        dailySuggestions
    }
};
</script>

<style lang="less">
.index-wrapper {
    width: 900px;
    margin: 2rem auto;
}
</style>
