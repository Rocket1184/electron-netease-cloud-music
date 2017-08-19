<template>
    <div class="artist-list">
        <mu-card v-for="ar in list"
            :key="ar.id"
            class="item">
            <mu-card-media :title="ar | artistTitle"
                :style="`background-image:url(${ar.picUrl})`"></mu-card-media>
        </mu-card>
        <div v-for="al in list"
            :key="al.id"
            class="empty"></div>
    </div>
</template>

<script>
export default {
    props: {
        list: {
            type: Array
        }
    },
    filters: {
        artistTitle(ar) {
            const name = ar.name;
            const trans = ar.trans && ` (${ar.trans})` || '';
            return name + trans;
        }
    }
};
</script>

<style lang="less">
.artist-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    .item {
        margin: 20px;
        display: inline-block;
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
    .empty {
        width: 200px;
        margin: 0 20px;
    }
}
</style>
