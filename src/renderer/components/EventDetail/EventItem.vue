<template>
    <div class="event-item">
        <EventContent :event="event"
            :json="json"></EventContent>
        <div v-if="json.event"
            class="event-forward">
            <EventContent :event="json.event"
                :json="forwardJson"></EventContent>
        </div>
        <div class="event-buttons">
            <!-- TODO: like event -->
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
import EventContent from './EventContent.vue';

export default {
    props: {
        event: {
            type: Object,
            required: true
        }
    },
    computed: {
        json() {
            return JSON.parse(this.event.json);
        },
        forwardJson() {
            if (!this.json.event) return null;
            return JSON.parse(this.josn.event.json);
        }
    },
    components: {
        EventContent
    }
};
</script>

<style lang="less">
.event-item {
    .event-forward {
        background-color: rgba(0, 0, 0, 0.06);
        padding: 1px 8px;
        margin-left: 48px;
        margin-bottom: 8px;
    }
    .event-buttons {
        display: flex;
        margin-left: 44px;
        margin-bottom: 6px;
        .mu-flat-button {
            margin-right: 8px;
            min-width: unset;
            padding: 0;
        }
    }
}
</style>
