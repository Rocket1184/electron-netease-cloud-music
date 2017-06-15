<template>
    <div class="current-list">
        <mu-menu desktop
                 :width="400">
            <mu-menu-item v-for="(track, index) in playlist.list"
                          :title="track.name"
                          titleClass="menu-title"
                          :afterText="track.artistName"
                          afterTextClass="menu-after"
                          @click="handleListClick(index)"
                          :leftIcon="track.id==playing.track.id ? 'volume_up' : ''"
                          :key="track.id" />
        </mu-menu>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'playlist',
            'playing'
        ])
    },
    methods: {
        ...mapActions([
            'playTrackIndex'
        ]),
        handleListClick(index) {
            this.playTrackIndex({ index });
        }
    }
};
</script>

<style lang="less">
.current-list {
    overflow-x: hidden;
    .mu-menu-destop {
        padding: 0;
        .menu-title {
            width: 350px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .menu-title+div>span {

            display: block;
            white-space: nowrap;
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            color: grey;
        }
    }
}
</style>
