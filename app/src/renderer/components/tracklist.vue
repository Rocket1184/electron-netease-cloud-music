<template>
    <div>
        <mu-list-item title="播放全部"
                      @click="handlePlayAll">
            <mu-icon slot="left"
                     value="play_circle_filled" />
        </mu-list-item>
        <mu-divider />
        <mu-table class="playlist">
            <template v-for="track in list">
                <mu-tr>
                    <mu-td :title="track.name">
                        <span class="label">{{track.name}}</span>
                    </mu-td>
                    <mu-td :title="track.artistName">
                        <span class="label">{{track | formatArtists}}</span>
                    </mu-td>
                    <mu-td>
                        <mu-icon-button icon="favorite_border" />
                        <mu-icon-button icon="playlist_add" />
                    </mu-td>
                </mu-tr>
            </template>
        </mu-table>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: ['list'],
    data() {
        return {

        };
    },
    filters: {
        formatArtists(track) {
            const ar = track.ar || track.artists;
            return ar.map(a => a.name).join('/');
        }
    },
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
.playlist {
    .label {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    td:nth-child(3) {
        width: 140px;
    }
}
</style>
