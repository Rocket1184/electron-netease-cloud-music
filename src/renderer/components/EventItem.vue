<template>
    <div class="event-item">
        <div class="event-author">
            <div class="event-avatar-wrapper">
                <img class="event-avatar"
                    :src="avatar">
                <TypeBadge v-if="event.user.userType"
                    :type="event.user.userType"></TypeBadge>
            </div>
            <div class="event-title">
                <div>{{ event.user.nickname }}
                    <span v-if="shareType"
                        class="event-title-after">{{ shareType }}</span>
                </div>
                <div class="event-title-below">{{ event.eventTime | shortDate }}</div>
            </div>
            <div v-if="top"
                class="event-top">
                <mu-icon color="primary"
                    value="publish"></mu-icon>
            </div>
        </div>
        <div class="event-content">{{ json.msg }}</div>
        <div v-if="pics.length" class="event-pics">
            <img class="event-img"
                v-for="(p, index) in pics"
                :src="p"
                :key="index">
        </div>
        <div v-if="share"
            class="event-share">
            <img class="event-share-img"
                :src="share.img">
            <div>
                <div class="event-share-title">{{ share.title }}</div>
                <div class="event-share-subtitle">{{ share.subTitle }}</div>
            </div>
        </div>
        <div class="event-buttons">
            <mu-button flat
                small>
                <mu-icon left
                    size="16"
                    :color="event.info.liked ? 'primary': ''"
                    value="thumb_up"></mu-icon>
                <span>{{ event.info.likedCount }}</span>
            </mu-button>
            <mu-button flat
                small
                :to="{ name: 'comment', params: { type: 'event', id: `${event.id}_${event.user.userId}` } }">
                <mu-icon left
                    size="16"
                    value="comment"></mu-icon>
                <span>{{ event.info.commentCount }}</span>
            </mu-button>
        </div>
    </div>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

import TypeBadge from '@/components/UserDetail/TypeBadge.vue';

export default {
    props: {
        event: {
            type: Object,
            required: true
        },
        top: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        avatar() {
            return sizeImg(this.event.user.avatarUrl, HiDpiPx(40));
        },
        pics() {
            return this.event.pics.map(p => sizeImg(p.squareUrl, HiDpiPx(100)));
        },
        json() {
            return JSON.parse(this.event.json);
        },
        shareType() {
            switch (true) {
                case !this.json: return null;
                case !!this.json.event: return '转发：';
                case !!this.json.song: return '分享歌曲：';
                case !!this.json.album: return '分享专辑：';
                case !!this.json.playlist: return '分享歌单：';
                case !!this.json.video: return '分享视频：';
                case !!this.json.djRadio: return '分享电台：';
                case !!this.json.program: return '分享电台节目：';
            }
            return null;
        },
        share() {
            // TODO: more share types, and route ...
            if (!this.json) return null;
            let r = {};
            if (this.json.song) {
                const e = this.json.song;
                r = {
                    img: e.album.picUrl,
                    title: e.name,
                    subTitle: e.artists.map(ar => ar.name).join(' / ')
                };
            } else if (this.json.djRadio) {
                const e = this.json.djRadio;
                r = {
                    img: e.picUrl,
                    title: e.name,
                    subTitle: e.dj.nickname
                };
            } else if (this.json.program) {
                const e = this.json.program;
                r = {
                    img: e.coverUrl,
                    title: e.name,
                    subTitle: e.radio.name
                };
            }
            if (!r.img) return null;
            r.img = sizeImg(r.img, HiDpiPx(40));
            return r;
        }
    },
    filters: {
        shortDate
    },
    components: {
        TypeBadge
    }
};
</script>

<style lang="less">
.event-item {
    .event-author,
    .event-content,
    .event-share,
    .event-pics {
        margin-bottom: 8px;
    }
    .event-author {
        display: flex;
        margin-top: 8px;
        .event-avatar-wrapper {
            position: relative;
            height: 40px;
            width: 40px;
            margin-right: 8px;
            .event-avatar {
                height: 40px;
                width: 40px;
                border-radius: 20px;
            }
        }
        .event-title {
            .event-title-after,
            .event-title-below {
                color: grey;
            }
            .event-title-below {
                font-size: 12px;
            }
        }
        .event-top {
            margin-left: auto;
        }
    }
    .event-content,
    .event-pics,
    .event-share {
        margin-left: 48px;
    }
    .event-pics {
        .event-img {
            width: 100px;
        }
    }
    .event-share {
        display: flex;
        align-items: center;
        height: 48px;
        padding-left: 4px;
        background-color: rgba(0, 0, 0, 0.1);
        .event-share-img {
            width: 40px;
            height: 40px;
            margin-right: 8px;
        }
        .event-share-subtitle {
            color: grey;
        }
    }
    .event-buttons {
        display: flex;
        margin-left: 32px;
        margin-bottom: 6px;
        .mu-flat-button {
            margin-right: 8px;
        }
    }
}
</style>
