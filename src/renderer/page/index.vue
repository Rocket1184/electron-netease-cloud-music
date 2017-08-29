<template>
    <div class="index-wrapper">
        <dailySuggestions></dailySuggestions>
    </div>
</template>

<script>
import dailySuggestions from 'compo/dailySuggestions';

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
