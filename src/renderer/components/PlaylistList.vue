<template>
    <div class="playlist-list">
        <mu-card v-for="pl in list"
            :key="pl.id"
            class="item"
            @click="navigateToList(pl.id)">
            <mu-card-media :title="pl.name"
                class="pic"
                :style="coverImgStyle(pl)">
            </mu-card-media>
            <mu-card-header :title="pl.creator.nickname"
                :subTitle="playlistSummary(pl)">
            </mu-card-header>
        </mu-card>
        <div v-for="i in 10"
            :key="i"
            class="empty"></div>
    </div>
</template>

<script>
import { bkgImg, sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        /** @type {Vue.PropOptions<Models.PlayList>} */
        list: {
            type: Array
        }
    },
    methods: {
        coverImgStyle(pl) {
            return bkgImg(sizeImg(pl.coverImgUrl, HiDpiPx(200), HiDpiPx(160)));
        },
        playlistSummary(pl) {
            return `${pl.trackCount} 首，播放 ${pl.playCount} 次`;
        },
        navigateToList(id) {
            this.$router.push({ name: 'playlist', params: { id } });
        }
    }
};
</script>

<style lang="less">
.playlist-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    .item {
        width: 200px;
        margin: 20px;
        cursor: pointer;
        .pic {
            width: 200px;
            height: 200px;
            background-size: cover;
            background-position: center center;
        }
        .mu-card-header {
            height: 60px;
            padding: 10px;
            .mu-card-header-title {
                padding: 0;
                .mu-card-title {
                    width: 110px;
                    font-size: 1em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
        .mu-card-media-title {
            padding: 1em;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
            .mu-card-title {
                font-size: 1em;
                line-height: 100%;
                color: white;
                filter: drop-shadow(0 0 4px black);
            }
        }
    }
    .empty {
        width: 200px;
        margin: 0 20px;
    }
}
</style>
