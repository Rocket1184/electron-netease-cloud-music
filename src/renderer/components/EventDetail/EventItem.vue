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
            <mu-button flat
                small
                @click="handleLike">
                <mu-icon left
                    size="16"
                    :color="event.info.liked ? 'primary': ''"
                    value="thumb_up"></mu-icon>
                <span>{{ event.info.likedCount }}</span>
            </mu-button>
            <router-link :to="{ name: 'comment', params: { type: 'event', id: `${event.id}_${event.user.userId}` } }"
                v-slot="{ navigate }"
                custom>
                <mu-button flat
                    small
                    @click="navigate">
                    <mu-icon left
                        size="16"
                        value="comment"></mu-icon>
                    <span>{{ event.info.commentCount }}</span>
                </mu-button>
            </router-link>
        </div>
    </div>
</template>

<script>
import EventContent from './EventContent.vue';

export default {
    props: {
        /** @type {Vue.PropOptions<Types.Event>} */
        event: {
            type: Object,
            required: true
        }
    },
    computed: {
        /** @return {any} */
        json() {
            return JSON.parse(this.event.json);
        },
        /** @return {any?} */
        forwardJson() {
            if (!this.json.event) return null;
            return JSON.parse(this.json.event.json);
        }
    },
    methods: {
        handleLike() {
            this.$emit('like', this.event);
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
