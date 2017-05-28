<template>
    <mu-list>
        <template v-for="(list, index) in listToShow">
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
    props: {
        showCollected: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            coverSize: window.devicePixelRatio * 40
        };
    },
    computed: {
        ...mapGetters([
            'user'
        ]),
        listToShow() {
            return this.user.playlist.filter(i => {
                if (this.showCollected === true) return true;
                return i.creator.id == this.user.id;
            });
        }
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
