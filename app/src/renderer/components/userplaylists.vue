<template>
    <mu-list>
        <template v-for="(list, index) in userPlayLists">
            <mu-list-item :title="list.name"
                          @click="handleRowClick(list, index)">
                <mu-avatar :src="formatImg(list.coverImgUrl)"
                           slot="leftAvatar" />
            </mu-list-item>
        </template>
    </mu-list>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data () {
        return {
            coverSize: window.devicePixelRatio * 40
        };
    },
    computed: {
        ...mapGetters([
            'userPlayLists'
        ])
    },
    methods: {
        formatImg(url) {
            const size = this.coverSize;
            return `${url}?param=${size}y${size}`;
        },
        handleRowClick(list, index) {
            this.$emit('rowClick', list, index);
        }
    }
};
</script>

<style lang="less">

</style>
