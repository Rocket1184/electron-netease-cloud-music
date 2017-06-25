<template>
    <div class="myplaylist">
        <div class="aside">
            <mu-list>
                <mu-list-item v-for="(e, i) in playlist"
                    :key="i"
                    :title="e.name"
                    titleClass="list-name"
                    @click="loadPlaylist(i)"></mu-list-item>
            </mu-list>
        </div>
        <div class="content">
            <trackList :list="list"></trackList>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import { Track } from '../util/models';
import ApiRenderer from '../util/apiRenderer';
import trackList from '../components/trackList';

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
        trackList
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
