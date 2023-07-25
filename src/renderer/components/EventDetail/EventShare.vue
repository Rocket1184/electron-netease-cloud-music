<template>
    <component :is="share.route ? 'router-link' : 'div'"
        class="event-share"
        :to="share.route">
        <img v-if="share.img"
            class="event-share-img"
            :src="share.img">
        <div>
            <div class="event-share-title">
                <router-link v-if="share.author"
                    class="event-share-author"
                    :to="{ name: 'user', params: { id: share.author.userId } }">@{{ share.author.nickname }}</router-link>
                {{ share.title }}
            </div>
            <div class="event-share-subtitle">{{ share.subTitle }}</div>
        </div>
    </component>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';

export default {
    props: {
        /** @type {Vue.PropOptions<any>} */
        json: {
            required: true
        }
    },
    computed: {
        /** @returns {{ img: string, title: string, subTitle: string, route?: import('vue-router').Route, author?: Models.Profile }} */
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
                    subTitle: (e.artists || [e.artist]).map(ar => ar.name).join(' / '),
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
            } else if (j.resource) {
                const e = j.resource;
                r = {
                    author: e.user,
                    title: e.content,
                    subTitle: e.resourceName
                };
            }
            if (r.img) {
                r.img = sizeImg(r.img, HiDpiPx(40));
            }
            return r;
        }
    }
};
</script>

<style lang="less">
.event-share {
    display: flex;
    padding: 4px;
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
