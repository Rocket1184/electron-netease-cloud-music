<template>
    <router-link :to="to"
        tag="div"
        class="s-item">
        <div class="it-cover"
            :style="bkgImgStyle(img)">
            <div class="co-name">
                <mu-icon :value="subIcon"
                    :size="16"></mu-icon>
                <span class="name-cnt">{{subTitle}}</span>
            </div>
        </div>
        <div class="it-desc">{{desc}}</div>
    </router-link>
</template>

<script>
import { bkgImg, sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        to: {
            required: true
        },
        img: {
            type: String,
            required: true
        },
        subIcon: {
            type: String,
            required: true
        },
        subTitle: {
            required: true
        },
        desc: {
            required: true
        }
    },
    methods: {
        bkgImgStyle(img) {
            return bkgImg(sizeImg(img, HiDpiPx(160)));
        }
    }
};
</script>

<style lang="less">
.s-item {
    min-width: 160px;
    width: 160px;
    height: 210px;
    margin-left: 12px;
    cursor: pointer;
    &:last-child {
        padding-right: 12px;
    }
    .it-cover {
        height: 160px;
        background-size: cover;
        display: flex;
        flex-direction: column-reverse;
        .co-name {
            color: #e5e2e5;
            padding: 0.4em 0.8em;
            background-color: rgba(0, 0, 0, 0.54);
            display: flex;
            align-items: center;
            .name-cnt {
                margin-left: 4px;
                flex-grow: 1;
            }
        }
        .mu-icon {
            color: #e5e2e5;
        }
    }
    .it-desc {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
}
</style>
