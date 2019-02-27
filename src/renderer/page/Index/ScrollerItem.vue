<template>
    <router-link :to="to"
        :title="title"
        tag="div"
        class="s-item">
        <div class="i-pic"
            :style="bkgImgStyle(img)">
            <div v-if="maskIcon"
                class="p-mask">
                <mu-icon :value="maskIcon"
                    :size="16"></mu-icon>
                <span class="m-text">{{maskText}}</span>
            </div>
        </div>
        <div v-if="itemSubTitle"
            class="i-title-2-lines">
            <div class="i-title-div">{{itemTitle}}</div>
            <div class="i-title-div i-title-sub">{{itemSubTitle}}</div>
        </div>
        <div v-else
            class="i-title-1-line">{{itemTitle}}</div>
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
        title: {
            type: String,
            required: false
        },
        maskIcon: {
            type: String,
            required: false
        },
        maskText: {
            type: String,
            required: false
        },
        itemTitle: {
            type: String,
            required: true
        },
        itemSubTitle: {
            type: String,
            required: false
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
    direction: ltr;
    transform-origin: 100% 0;
    transform: rotate(90deg) translateX(100%);
    width: 160px;
    height: 160px;
    margin: 12px 0;
    overflow: visible;
    cursor: pointer;
    position: relative;
    .i-pic {
        height: 160px;
        background-size: cover;
        display: flex;
        flex-direction: column-reverse;
        .p-mask {
            color: #e5e2e5;
            padding: 0.4em 0.8em;
            background-color: rgba(0, 0, 0, 0.54);
            display: flex;
            align-items: center;
            .m-text {
                margin-left: 4px;
                flex-grow: 1;
            }
        }
        .mu-icon {
            color: #e5e2e5;
        }
    }
    .i-title-1-line {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .i-title-1-line,
    .i-title-2-lines,
    .i-title-div {
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .i-title-1-line,
    .i-title-2-lines {
        height: 42px;
    }
    .i-title-div {
        white-space: nowrap;
    }
    .i-title-sub {
        opacity: 0.62;
    }
}
</style>
