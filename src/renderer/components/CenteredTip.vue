<template>
    <div class="centered-tip">
        <mu-icon :value="icon"
            color="grey"
            :size="128"></mu-icon>
        <p>{{tip}}</p>
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: String,
            required: false,
            default: 'build'
        },
        tip: {
            type: String,
            required: false,
            default: '呃 ... 此功能正在开发中 ...'
        }
    }
};
</script>

<style lang="less">
.centered-tip {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: grey;
}
</style>
