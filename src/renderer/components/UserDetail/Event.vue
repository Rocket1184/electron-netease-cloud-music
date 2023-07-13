<template>
    <div class="user-event">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <CenteredTip v-else-if="events.length === 0"
            icon="cloud_off"
            tip="暂无动态"></CenteredTip>
        <template v-else>
            <EventItem v-if="topEvent"
                :event="topEvent"
                @like="handleLike"></EventItem>
            <EventItem v-for="e in events"
                :key="e.id"
                :event="e"
                @like="handleLike"></EventItem>
        </template>
        <div v-if="more"
            class="event-more">
            <div v-if="loadingMore"
                class="event-more-loading">
                <span class="event-more-text">正在加载</span>
                <mu-circular-progress color="secondary"
                    :size="16"
                    :stroke-width="2"></mu-circular-progress>
            </div>
            <mu-button v-else
                flat
                small
                @click="handleLoadMore">加载更多
                <mu-icon right
                    value="expand_more"></mu-icon>
            </mu-button>
        </div>
    </div>
</template>

<script>
import Api from '@/api/ipc';

import EventItem from '@/components/EventDetail/EventItem.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        user: {
            type: Object
        }
    },
    data() {
        return {
            loading: true,
            more: false,
            loadingMore: false,
            total: -1,
            lastTime: -1,
            events: [],
            topEvent: null
        };
    },
    methods: {
        pickTopEvent() {
            if (!this.topEvent) return;
            const te = this.events.find(e => e.id === this.topEvent.id);
            if (!te) return;
            this.topEvent = te;
        },
        getEvents() {
            this.loading = true;
            const id = this.user.profile.userId;
            const p1 = Api.getUserEvents(id).then(r => {
                if (r.code === 200) {
                    this.more = r.more;
                    this.lastTime = r.lasttime;
                    this.events = r.events;
                }
            });
            const p2 = Api.getUserTopEvents(id).then(r => {
                if (r.code === 200) {
                    this.topEvent = r.data;
                }
            });
            Promise.all([p1, p2]).then(() => {
                this.pickTopEvent();
                this.loading = false;
            });
        },
        /**
         * @param {Types.Event} event
         */
        async handleLike(event) {
            const requestLike = event.info.liked ? Api.unlikeResource : Api.likeResource;
            const resp = await requestLike(event.info.threadId);
            if (resp.code === 200) {
                event.info.likedCount += event.info.liked ? -1 : 1;
                event.info.liked = !event.info.liked;
            }
        },
        handleLoadMore() {
            this.loadingMore = true;
            Api.getUserEvents(this.user.profile.userId, this.lastTime).then(r => {
                if (r.code === 200) {
                    this.more = r.more;
                    this.lastTime = r.lasttime;
                    this.events = this.events.concat(r.events);
                    this.pickTopEvent();
                }
                this.loadingMore = false;
            });
        }
    },
    mounted() {
        this.getEvents();
    },
    components: {
        EventItem,
        CenteredTip,
        CenteredLoading
    }
};
</script>

<style lang="less">
.user-event {
    padding: 8px 24px;
    .event-item:not(:first-child) {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    .event-more {
        margin: 24px 44px;
        font-size: 13px;
        .event-more-loading {
            padding: 0 8px;
            height: 28px;
            display: flex;
            align-items: center;
            .event-more-text {
                margin-right: 10px;
            }
        }
    }
}
</style>
