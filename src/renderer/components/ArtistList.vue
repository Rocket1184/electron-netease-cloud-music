<template>
    <div class="artist-list">
        <mu-card v-for="ar in list"
            :key="ar.id"
            class="item"
            @click="navigateToArtsit(ar.id)">
            <mu-card-media :title="ar | artistTitle"
                :style="ar | artistImgStyle"></mu-card-media>
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
        list: {
            type: Array
        }
    },
    methods: {
        navigateToArtsit(id) {
            this.$router.push({ name: 'artist', params: { id } });
        }
    },
    filters: {
        artistTitle(ar) {
            const name = ar.name;
            const trans = ar.trans && ` (${ar.trans})` || '';
            return name + trans;
        },
        artistImgStyle(ar) {
            return bkgImg(sizeImg(ar.picUrl, HiDpiPx(200), HiDpiPx(160)));
        }
    }
};
</script>

<style lang="less">
.artist-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 10px;
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
        .mu-card-media {
            width: 200px;
            height: 160px;
            background-size: cover;
            background-position: center center;
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
