<template>
    <router-link :to="to"
        :title="title"
        tag="div"
        class="scroll-item">
        <div class="pic"
            :style="bkgImgStyle(img)">
            <div v-if="maskIcon"
                class="mask">
                <mu-icon :value="maskIcon"
                    :size="16"></mu-icon>
                <span class="text">{{maskText}}</span>
            </div>
        </div>
        <div v-if="itemSubTitle"
            class="title">
            <div class="nowrap ellipsis">{{itemTitle}}</div>
            <div class="nowrap ellipsis sub">{{itemSubTitle}}</div>
        </div>
        <div v-else
            class="title ellipsis">{{itemTitle}}</div>
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
.scroll-item {
    width: 160px;
    min-width: 160px;
    height: 210px;
    margin-left: 12px;
    overflow: visible;
    cursor: pointer;
    &:last-child {
        padding-right: 12px;
    }
    .pic {
        height: 160px;
        background-size: cover;
        display: flex;
        flex-direction: column-reverse;
        .mask {
            color: #e5e2e5;
            padding: 0.4em 0.8em;
            background-color: rgba(0, 0, 0, 0.54);
            display: flex;
            align-items: center;
            .text {
                margin-left: 4px;
                flex-grow: 1;
            }
        }
        .mu-icon {
            color: #e5e2e5;
        }
    }
    .title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        height: 42px;
        .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .nowrap {
            white-space: nowrap;
        }
        .sub {
            opacity: 0.62;
        }
    }
}
</style>
