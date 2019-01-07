<template>
    <mu-list-item button
        @click="handleBack">
        <mu-list-item-action>
            <mu-icon size="24"
                value="arrow_back"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>返回</mu-list-item-title>
    </mu-list-item>
</template>

<script>
export default {
    methods:{
        handleBack() {
            this.$router.back();
        }
    }
};
</script>
