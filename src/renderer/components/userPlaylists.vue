<template>
    <mu-list class="user-playlists">
        <PlaylistItem v-for="(list, index) in listToShow"
            :key="index"
            :item="list"
            @click="handleRowClick(list, index)">
        </PlaylistItem>
    </mu-list>
</template>

<script>
import { mapGetters } from 'vuex';
import PlaylistItem from './myPlaylistItem';

export default {
    props: {
        showCollected: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    computed: {
        ...mapGetters([
            'user'
        ]),
        listToShow() {
            return this.user.playlist.filter(i => {
                if (this.showCollected === true) return true;
                return i.creator.id == this.user.id;
            });
        }
    },
    methods: {
        handleRowClick(list, index) {
            this.$emit('rowClick', list, index);
        }
    },
    components: {
        PlaylistItem
    }
};
</script>

<style lang="less">
.user-playlists {
    min-width: 400px;
}
</style>
