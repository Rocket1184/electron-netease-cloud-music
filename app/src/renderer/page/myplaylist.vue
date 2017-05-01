<template>
    <div class="myplaylist">
        <div class="aside">
            <mu-list>
                <template v-for="(e, i) in playlist">
                    <mu-list-item :title="e.name"
                                  titleClass="list-name"
                                  @click="loadPlaylist(i)" />
                </template>
            </mu-list>
        </div>
        <div class="content">
            <TrackList :list="list" />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import { Track } from '../util/models';
import ApiRenderer from '../util/apirenderer';
import TrackList from '../components/tracklist';

export default {
    data() {
        return {
            list: []
        };
    },
    computed: {
        ...mapState({
            playlist: state => state.user.playlist
        }),
    },
    methods: {
        async loadPlaylist(index) {
            this.list = [];
            const raw = await ApiRenderer.getListDetail(this.playlist[index].id);
            this.list = raw.playlist.tracks.map(t => new Track(t));
        }
    },
    created() {
        this.loadPlaylist(0);
    },
    components: {
        TrackList
    }
};
</script>

<style lang="less">
.myplaylist {
    display: flex;
    flex-direction: row;
    height: 100%;
    .aside {
        flex: 1;
        height: 100%;
        overflow: auto;
        .list-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
        }
    }
    .content {
        flex: 4;
        height: 100%;
        overflow: auto;
    }
}
</style>
