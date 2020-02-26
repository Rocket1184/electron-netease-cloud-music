<template>
    <div class="album-list">
        <mu-card v-for="al in list"
            :key="al.id"
            class="item"
            @click="navigateToAlbum(al.id)">
            <mu-card-header v-if="showArtist"
                :title="al.artist.name"
                :subTitle="shortDate(al.publishTime)">
                <template #avatar>
                    <mu-avatar>
                        <img :src="artistAvatarUrl(al)">
                    </mu-avatar>
                </template>
            </mu-card-header>
            <mu-card-media :title="al.name"
                class="pic"
                :style="albumImgStyle(al)">
            </mu-card-media>
        </mu-card>
        <div v-for="i in 10"
            :key="i"
            class="empty"></div>
    </div>
</template>

<script>
import { shortDate } from '@/util/formatter';
import { bkgImg, sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        list: {
            type: Array
        },
        showArtist: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        shortDate,
        artistAvatarUrl(al) {
            return sizeImg(al.artist.picUrl, HiDpiPx(40));
        },
        albumImgStyle(al) {
            return bkgImg(sizeImg(al.picUrl, HiDpiPx(200), HiDpiPx(160)));
        },
        navigateToAlbum(id) {
            this.$router.push({ name: 'album', params: { id } });
        }
    }
};
</script>

<style lang="less">
.album-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 20px;
    .item,
    .empty {
        width: 200px;
        margin: 20px 10px 0;
    }
    .empty {
        margin-top: 0;
    }
    .item {
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
}
</style>
