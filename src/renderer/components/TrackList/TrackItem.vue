<template>
    <ncm-mu-dbclick-ripple class="track-row"
        :class="dynamicClassName"
        @dblclick="handleDblClick">
        <div v-if="index"
            class="track-col index">
            <i v-if="isPlaying"
                class="material-icons">volume_up</i>
            <template v-else>{{ index }}</template>
        </div>
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
        <div class="track-col album">
            <router-link v-if="track.album !== null && track.album.id !== 0"
                class="link"
                :to="{ name: 'album', params: { id: track.album.id } }"
                :key="track.album.id">{{track.album.name}}</router-link>
            <span v-else
                :key="'album' + track.album.name">{{ track.album.name }}</span>
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

/**
 * @typedef {import('./TrackList.vue').TrackListShortcut} Shortcut
 */

export default {
    props: {
        index: {
            type: Number,
            required: false
        },
        /** @type {Vue.PropOptions<Models.Track>} */
        track: {
            required: true
        },
        /** @type {Vue.PropOptions<Shortcut[]>} */
        shortcuts: {
            type: Array,
            required: false
        }
    },
    computed: {
        /** @returns {boolean} */
        isPlaying() {
            return this.$store.getters.playing.id === this.track.id;
        },
        /** @returns {{ [key: string]: boolean }} */
        dynamicClassName() {
            return {
                'track--grey': (this.track.privilege && this.track.privilege.st !== 0)
            };
        },
        /** @returns {string} */
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
        color: var(--secondary-text-color);
        .material-icons {
            line-height: 40px;
            font-size: 18px;
            color: var(--accent-color);
        }
    }
    .name,
    .album,
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
    .album,
    .duration,
    .buttons .mu-icon {
        color: var(--disabled-text-color);
    }
}
</style>
