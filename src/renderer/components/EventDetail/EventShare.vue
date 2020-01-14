<template>
    <router-link class="event-share"
        :to="share.route">
        <img class="event-share-img"
            :src="share.img">
        <div>
            <div class="event-share-title">{{ share.title }}</div>
            <div class="event-share-subtitle">{{ share.subTitle }}</div>
        </div>
    </router-link>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        json: {
            type: Object,
            required: true
        }
    },
    computed: {
        share() {
            const j = this.json;
            if (!j) return null;
            let r = {};
            if (j.song) {
                // TODO: add song to playlist directly?
                const e = j.song;
                r = {
                    img: e.album.picUrl,
                    title: e.name,
                    subTitle: e.artists.map(ar => ar.name).join(' / '),
                    route: { name: 'album', params: { id: e.album.id } }
                };
            } else if (j.album) {
                const e = j.album;
                r = {
                    img: e.picUrl,
                    title: e.name,
                    subTitle: e.artists.map(ar => ar.name).join(' / '),
                    route: { name: 'album', params: { id: e.id } }
                };
            } else if (j.playlist) {
                const e = j.playlist;
                r = {
                    img: e.coverImgUrl,
                    title: e.name,
                    subTitle: e.creator.nickname,
                    route: { name: 'playlist', params: { id: e.id } }
                };
            } else if (j.mv) {
                const e = j.mv;
                r = {
                    img: e.imgurl,
                    title: e.name,
                    subTitle: e.artists.map(ar => ar.name).join(' / '),
                    route: { name: 'video', params: { id: e.id } }
                };
            } else if (j.video) {
                const e = j.video;
                r = {
                    img: e.coverUrl,
                    title: e.title,
                    subTitle: e.creator.nickname,
                    route: { name: 'video', params: { id: e.videoId } }
                };
            } else if (j.djRadio) {
                const e = j.djRadio;
                r = {
                    img: e.picUrl,
                    title: e.name,
                    subTitle: e.dj.nickname,
                    route: { name: 'djradio', params: { id: e.id } }
                };
            } else if (j.program) {
                const e = j.program;
                r = {
                    img: e.coverUrl,
                    title: e.name,
                    subTitle: e.radio.name,
                    // TODO: highlight program on radio page, or play it directly?
                    route: { name: 'djradio', params: { id: e.radio.id } }
                };
            }
            if (!r.img) return null;
            r.img = sizeImg(r.img, HiDpiPx(40));
            return r;
        }
    }
};
</script>

<style lang="less">
.event-share {
    display: flex;
    align-items: center;
    height: 48px;
    padding-left: 4px;
    color: inherit;
    background-color: rgba(0, 0, 0, 0.06);
    .event-share-img {
        width: 40px;
        height: 40px;
        margin-right: 8px;
    }
    .event-share-subtitle {
        color: grey;
    }
}
</style>
