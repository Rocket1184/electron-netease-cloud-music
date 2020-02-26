<template>
    <div class="v-list">
        <router-link v-for="v in videos"
            :key="v.id"
            :to="{ name:'video', params:{ id: v.id } }"
            tag="div"
            class="v-item">
            <div class="v-cover"
                :style="bkgImgStyle(v.picUrl)">
                <div class="playcnt">
                    <span class="cnt-number">{{humanCount(v.playCount)}}</span>
                    <mu-icon value="videocam"
                        :size="16"></mu-icon>
                </div>
                <div class="duration">{{shortTime(v.duration)}}</div>
            </div>
            <span class="name">
                <span v-if="showBadge && v.type === 0">
                    <mu-badge content="MV"
                        color="primary"></mu-badge>
                </span>
                <span>{{v.name}}</span>
            </span>
        </router-link>
        <div v-for="i in 10"
            :key="i"
            class="empty"></div>
    </div>
</template>

<script>
import { shortTime, humanCount } from '@/util/formatter';
import { bkgImg, sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        videos: {
            type: Array,
            required: true
        },
        showBadge: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        shortTime,
        humanCount,
        bkgImgStyle(img) {
            return bkgImg(sizeImg(img, HiDpiPx(160), HiDpiPx(120)));
        }
    }
};
</script>

<style lang="less">
.v-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 10px;
    .v-item,
    .empty {
        margin: 20px 8px 0;
        width: 160px;
    }
    .empty {
        margin-top: 0;
    }
    .v-item {
        cursor: pointer;
        .v-cover {
            height: 120px;
            background-size: cover;
            background-position: center;
            position: relative;
            .playcnt {
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                padding: 2px 6px;
                color: #fff;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
                background: linear-gradient(rgba(0, 0, 0, 0.5), transparent);
                .cnt-number {
                    margin-left: 4px;
                }
                .mu-icon {
                    color: #fff;
                }
            }
            .duration {
                position: absolute;
                bottom: 0;
                right: 0;
                left: 0;
                padding: 2px 6px;
                color: #fff;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
            }
        }
        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            .mu-badge-container {
                margin-right: 4px;
            }
        }
    }
}
</style>
