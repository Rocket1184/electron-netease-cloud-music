<template>
    <div>
        <mu-list-item title="播放全部"
                      @click="handlePlayAll">
            <mu-icon slot="left"
                     value="play_circle_filled" />
        </mu-list-item>
        <mu-divider />
        <mu-table class="playlist">
            <template v-for="song in list">
                <mu-tr>
                    <mu-td :title="song.name">
                        <span class="label">{{song.name}}</span>
                    </mu-td>
                    <mu-td :title="song.artistName">
                        <span class="label">{{song.artists.map(a=>a.name).join('/')}}</span>
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
