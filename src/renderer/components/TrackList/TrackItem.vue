<template>
    <ncm-mu-dbclick-ripple class="track-row"
        :class="dynamicClassName"
        @dblclick="handleDblClick">
        <div v-if="index"
            class="track-col index">{{index}}</div>
        <div class="track-col name">{{track.name}}</div>
        <div class="track-col artist">
            <template v-for="(ar, index) in track.artists">
                <span v-if="index !== 0"
                    :key="'sep' + index"
                    class="sep">/</span>
                <router-link v-if="ar.id !== 0"
                    class="link"
                    :to="{ name: 'artist', params: { id: ar.id } }"
                    :key="ar.id">{{ar.name}}</router-link>
                <span v-else
                    :key="'ar' + index">{{ar.name}}</span>
            </template>
        </div>
        <div class="track-col duration">{{duration}}</div>
        <div class="track-col buttons">
            <mu-button v-for="act in shortcuts"
                :key="act.event"
                icon
                small
                :title="act.title"
                @click="handleAction(act)">
                <mu-icon :value="act.icon"></mu-icon>
            </mu-button>
        </div>
    </ncm-mu-dbclick-ripple>
</template>

<script>
import { shortTime } from '@/util/formatter';

export default {
    props: {
        index: {
            type: Number,
            required: false
        },
        track: {
            required: true
        },
        shortcuts: {
            type: Array,
            required: false
        }
    },
    computed: {
        dynamicClassName() {
            return {
                'track--grey': (this.track.privilege && this.track.privilege.st !== 0)
            };
        },
        duration() {
            return shortTime(this.track.duration);
        }
    },
    methods: {
        handleDblClick() {
            this.$emit('dblclick');
        },
        handleAction(act) {
            this.$emit(act.event);
        }
    }
};
</script>

<style lang="less">
.track-row {
    display: flex;
    position: relative;
    .track-col {
        height: 40px;
        line-height: 40px;
    }
    .index {
        width: 46px;
        text-align: center;
    }
    .name,
    .artist {
        flex-grow: 1;
        flex-basis: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        z-index: 1;
        .link {
            color: inherit;
            &:hover {
                text-decoration: underline;
            }
        }
        .sep {
            margin: 0 3px;
        }
    }
    .duration {
        width: 48px;
        margin-left: 2px;
    }
    .buttons {
        display: flex;
        align-items: center;
        .mu-icon {
            opacity: 0.6;
        }
    }
}

.track--grey {
    .name,
    .artist,
    .duration {
        opacity: 0.4;
    }
    .buttons {
        .mu-icon {
            opacity: 0.3;
        }
    }
}
</style>
