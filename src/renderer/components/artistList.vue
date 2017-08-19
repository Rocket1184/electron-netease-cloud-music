<template>
    <div class="artist-list">
        <mu-card v-for="ar in list"
            :key="ar.id"
            class="item">
            <mu-card-media :title="ar.name">
                <img :src="ar.picUrl" />
            </mu-card-media>
        </mu-card>
    </div>
</template>

<script>
export default {
    props: {
        list: {
            type: Array
        }
    }
};
</script>

<style lang="less">
.artist-list {
    text-align: center;
    .mu-card {
        width: 200px;
        margin: 20px;
        display: inline-block;
    }
    .mu-card-title {
        text-align: initial;
        font-size: 1em;
        line-height: 100%;
        color: white;
        filter: drop-shadow(0 0 4px black);
    }
    .mu-card-media-title {
        padding: 1em;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
    }
}
</style>
