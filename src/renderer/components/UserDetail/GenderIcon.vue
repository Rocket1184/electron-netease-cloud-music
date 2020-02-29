<template>
    <span class="user-gender"
        :class="userGender.class">{{ userGender.icon }}</span>
</template>

<script>
const Gender = [
    null,
    { icon: '♂️', class: 'user-gender-1' },
    { icon: '♀️', class: 'user-gender-2' }
];

export default {
    props: {
        gender: {
            type: [String, Number],
            required: true
        }
    },
    computed: {
        userGender() {
            return Gender[this.gender];
        }
    }
};
</script>

<style lang="less">
.user-gender {
    text-shadow: none;
}
.user-gender-1 {
    color: #2196f3; // blue500
}
.user-gender-2 {
    color: #f06292; // pink300
}
</style>
