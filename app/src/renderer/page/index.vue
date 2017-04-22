<template>
    <div class="index-wrapper">
        <DailySuggestions/>
    </div>
</template>

<script>
import DailySuggestions from '../components/dailysuggestions';

export default {
    components: {
        DailySuggestions
    }
};
</script>

<style lang="less">
.index-wrapper {
    width: 900px;
    margin: 2rem auto;
}
</style>
