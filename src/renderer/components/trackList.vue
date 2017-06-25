<template>
    <div class="tracklist">
        <template v-if="list.length !== 0">
            <mu-list-item title="播放全部"
                @click="handlePlayAll">
                <mu-icon slot="left"
                    value="play_circle_filled"></mu-icon>
            </mu-list-item>
            <mu-divider></mu-divider>
            <mu-table class="table">
                <mu-tr v-for="(track, index) in list"
                    :key="index">
                    <mu-td :title="track.name">
                        <span class="label">{{track.name}}</span>
                    </mu-td>
                    <mu-td :title="track.artistName">
                        <span class="label">{{track.artistName}}</span>
                    </mu-td>
                    <mu-td>
                        <mu-icon-button icon="favorite_border"></mu-icon-button>
                        <mu-icon-button icon="playlist_add"></mu-icon-button>
                    </mu-td>
                </mu-tr>
            </mu-table>
        </template>
        <div v-else
            class="loading-wrapper">
            <mu-circular-progress :size="60"
                :strokeWidth="5"></mu-circular-progress>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: ['list'],
    methods: {
        ...mapActions([
            'playPlaylist'
        ]),
        handlePlayAll() {
            this.playPlaylist({ list: this.list });
        }
    }
};
</script>

<style lang="less">
.tracklist {
    width: 100%;
    .table {
        .label {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        td:nth-child(3) {
            width: 140px;
        }
    }
    .loading-wrapper {
        height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>
