<template>
    <mu-list-item class="my-playlist-item"
        titleClass="name"
        :title="item.name"
        @click="$emit('click')"
        :describeText="`共 ${item.trackCount} 首`">
        <mu-avatar :src="coverUrl"
            slot="leftAvatar">
        </mu-avatar>
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
