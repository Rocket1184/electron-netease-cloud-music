<template>
    <mu-list-item avatar
        button
        class="avatar-li"
        @click="$emit('click')">
        <mu-list-item-action>
            <mu-avatar>
                <img :src="imgSrc">
            </mu-avatar>
        </mu-list-item-action>
        <mu-list-item-content>
            <mu-list-item-title>{{title}}</mu-list-item-title>
            <mu-list-item-sub-title>{{subTitle}}</mu-list-item-sub-title>
        </mu-list-item-content>
    </mu-list-item>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        img: {
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        subTitle:{
            type: String,
            required: true
        }
    },
    computed: {
        imgSrc() {
            return sizeImg(this.img, HiDpiPx(40));
        }
    }
};
</script>

<style lang="less">
.avatar-li {
    .mu-item-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
    }
}
</style>
