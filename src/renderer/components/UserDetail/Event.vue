<template>
    <div class="event-list">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <CenteredTip v-else-if="events.length === 0"
            icon="cloud_off"
            tip="暂无动态"></CenteredTip>
        <template v-else>
            <EventItem v-if="topEvent"
                top
                :event="topEvent"></EventItem>
            <EventItem v-for="e in events"
                :key="e.id"
                :event="e"></EventItem>
        </template>
    </div>
</template>

<script>
import Api from '@/api/ipc';

import EventItem from '@/components/EventItem.vue';
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
            total: -1,
            lastTime: -1,
            events: [],
            topEvent: null
        };
    },
    methods: {
        getEvents() {
            this.loading = true;
            const id = this.user.profile.userId;
            const p1 = Api.getUserEvents(id).then(r => {
                if (r.code === 200) {
                    this.total = r.size;
                    this.lastTime = r.lasttime;
                    this.events = r.events;
                }
            });
            const p2 = Api.getUserTopEvents(id).then(r => {
                if (r.code === 200) {
                    this.topEvent = r.data;
                }
            });
            Promise.all([p1, p2]).then(() => this.loading = false);
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
.event-list {
    margin: 8px 24px;
    .event-item:not(:first-child) {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
}
</style>
