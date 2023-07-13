<template>
    <mu-list-item avatar
        button
        class="avatar-li"
        v-bind="$attrs"
        v-on="$listeners">
        <mu-list-item-action>
            <slot>
                <mu-avatar>
                    <img :src="imgSrc">
                </mu-avatar>
            </slot>
        </mu-list-item-action>
        <mu-list-item-content>
            <mu-list-item-title>
                <mu-badge v-if="titleTag"
                    :content="titleTag"
                    color="primary"></mu-badge>
                {{title}}
            </mu-list-item-title>
            <mu-list-item-sub-title>{{subTitle}}</mu-list-item-sub-title>
        </mu-list-item-content>
    </mu-list-item>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        img: {
            type: String
        },
        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: true
        },
        titleTag: {
            type: String
        }
    },
    computed: {
        /** @returns {string} */
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
