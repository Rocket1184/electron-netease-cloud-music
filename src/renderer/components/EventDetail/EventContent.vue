<template>
    <div>
        <div class="event-author">
            <div class="event-avatar-wrapper">
                <img class="event-avatar"
                    :src="avatar">
                <TypeBadge v-if="event.user.userType"
                    :type="event.user.userType"></TypeBadge>
            </div>
            <div class="event-title">
                <div>
                    <router-link :to="{ name: 'user', params: { id: event.user.userId } }"
                        class="event-title-nickname">{{ event.user.nickname }}</router-link>
                    <span v-if="shareType"
                        class="event-title-after">{{ shareType }}</span>
                </div>
                <div class="event-title-below">{{ time }}</div>
            </div>
            <div v-if="event.topEvent"
                class="event-top"
                title="置顶动态">
                <mu-icon color="primary"
                    value="publish"></mu-icon>
            </div>
        </div>
        <div class="event-text">{{ json.msg }}</div>
        <div v-if="pics.length"
            class="event-pics">
            <!-- TODO: 查看大图 -->
            <img class="event-img"
                v-for="(p, index) in pics"
                :src="p"
                :key="index">
        </div>
        <EventShare v-if="hasShare"
            :json="json"></EventShare>
    </div>
</template>

<script>
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

import TypeBadge from '@/components/UserDetail/TypeBadge.vue';
import EventShare from './EventShare.vue';

const ShareFields = ['song', 'album', 'playlist', 'mv', 'video', 'djRadio', 'program', 'resource'];
const ShareFieldNames = ['歌曲', '专辑', '歌单', ' MV', '视频', '电台', '电台节目', '评论'];

export default {
    props: {
        /** @type {Vue.PropOptions<Types.Event>} */
        event: {
            required: true
        },
        /** @type {Vue.PropOptions<any>} */
        json: {
            required: true
        }
    },
    computed: {
        /** @returns {string} */
        avatar() {
            return sizeImg(this.event.user.avatarUrl, HiDpiPx(40));
        },
        /** @returns {string} */
        time() {
            return shortDate(this.event.eventTime);
        },
        /** @returns {string[]} */
        pics() {
            return this.event.pics.map(p => sizeImg(p.pcSquareUrl, HiDpiPx(100)));
        },
        /** @returns {string?} */
        shareType() {
            if (this.json.event) return '转发：';
            for (let i = 0; i < ShareFields.length; i++) {
                const k = ShareFields[i];
                if (k in this.json) {
                    return `分享${ShareFieldNames[i]}：`;
                }
            }
            return null;
        },
        /** @returns {boolean} */
        hasShare() {
            return ShareFields.some(f => f in this.json);
        }
    },
    components: {
        TypeBadge,
        EventShare
    }
};
</script>

<style lang="less">
.event-author,
.event-text,
.event-share,
.event-pics {
    margin-bottom: 8px;
}
.event-author {
    display: flex;
    align-items: center;
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
        .event-title-nickname {
            font-weight: bold;
            color: inherit;
        }
        .event-title-after {
            margin-left: 8px;
        }
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
        height: 24px;
    }
}
.event-text,
.event-pics,
.event-share {
    margin-left: 48px;
}
.event-pics {
    .event-img {
        width: 100px;
        margin-right: 3px;
    }
}
</style>
