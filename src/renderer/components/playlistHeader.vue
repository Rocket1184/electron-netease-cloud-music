<template>
    <div class="playlist-header">
        <img :src="coverSrc"
            class="cover">
        <div class="desc">
            <p class="name">{{detail.name}}</p>
            <mu-list-item :title="detail.creator.nickname"
                :afterText="`创建于 ${shortDate(detail.createTime)}`"
                disabled>
                <mu-avatar slot="left"
                    :src="detail.creator.avatarUrl" />
            </mu-list-item>
            <mu-icon-button icon="star"></mu-icon-button>
            <mu-icon-button icon="comment"></mu-icon-button>
        </div>
    </div>
</template>

<script>
import { getImgSizeOf, HiDpiPx } from '../util/image';
import { shortDate } from '../util/time';

export default {
    props: {
        detail: {
            required: true
        }
    },
    computed: {
        coverSrc() {
            return getImgSizeOf(this.detail.coverImgUrl, HiDpiPx(160));
        }
    },
    methods: {
        shortDate
    }
};
</script>

<style lang="less">
.playlist-header {
    height: 200px;
    background-size: cover;
    .cover {
        height: 160px;
        width: 160px;
        margin: 20px 10px 40px 40px;
    }
    .desc {
        display: inline-block;
        margin: 20px 0;
        vertical-align: top;
        width: calc(~"100% - 220px");
        .name {
            margin-left: 16px;
            font-size: 20px;
        }
    }
}
</style>
