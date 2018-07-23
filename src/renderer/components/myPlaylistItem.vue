<template>
    <mu-list-item avatar
        button
        class="my-playlist-item"
        @click="$emit('click')">
        <mu-list-item-action>
            <mu-avatar>
                <img :src="coverUrl">
            </mu-avatar>
        </mu-list-item-action>
        <mu-list-item-content>
            <mu-list-item-title class="name">{{item.name}}</mu-list-item-title>
            <mu-list-item-sub-title>共 {{item.trackCount}} 首</mu-list-item-sub-title>
        </mu-list-item-content>
    </mu-list-item>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        item: {
            required: true
        }
    },
    data() {
        return {};
    },
    computed: {
        coverUrl() {
            return sizeImg(this.item.coverImgUrl, HiDpiPx(40));
        }
    }
};
</script>

<style lang="less">
.my-playlist-item {
    .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
    }
}
</style>
