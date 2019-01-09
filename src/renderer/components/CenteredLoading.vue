<template>
    <div class="centered-loading">
        <mu-circular-progress color="secondary"
            :size="size"
            :stroke-width="stroke"></mu-circular-progress>
    </div>
</template>

<script>
export default {
    props: {
        size: {
            type: Number,
            required: false,
            default: 60
        },
        stroke: {
            type: Number,
            required: false,
            default: 5
        }
    }
};
</script>

<style lang="less">
.centered-loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: grey;
}
</style>
