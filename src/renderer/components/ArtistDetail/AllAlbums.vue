<template>
    <div class="all-albums">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <AlbumList v-else
            :list="albums"></AlbumList>
        <div class="pagination"
            v-if="showPagination">
            <mu-pagination :total="total"
                :current="currentPage"
                :page-size="pageSize"
                @change="handlePageChange">
            </mu-pagination>
        </div>
    </div>
</template>

<script>
import Api from '@/util/api';
import AlbumList from '@/components/AlbumList.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        artist: {
            required: true
        }
    },
    data() {
        return {
            albums: [],
            pageSize: 30,
            total: this.artist.detail.albumSize,
            loading: true,
            currentPage: 1
        };
    },
    computed: {
        showPagination() {
            return this.total > this.albums.length;
        }
    },
    methods: {
        async loadAlbums(offset = 0, limit = this.pageSize) {
            this.loading = true;
            const resp = await Api.getArtistAlbums(this.artist.detail.id, offset, limit);
            this.albums = resp.hotAlbums;
            this.loading = false;
        },
        async handlePageChange(newPage) {
            this.currentPage = newPage;
            await this.loadAlbums((this.currentPage - 1) * this.pageSize, this.pageSize);
            this.$emit('scroll');
        }
    },
    mounted() {
        this.loadAlbums();
    },
    components: {
        AlbumList,
        CenteredLoading
    }
};
</script>
