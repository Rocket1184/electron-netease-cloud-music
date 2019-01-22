<template>
    <div class="related-mvs">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <VideoList v-else
            :videos="mvs"></VideoList>
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
import { Video } from '@/util/models';
import VideoList from '@/components/VideoList.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        artist: {
            required: true
        }
    },
    data() {
        return {
            mvs: [],
            pageSize: 32,
            total: this.artist.detail.mvSize,
            loading: true,
            currentPage: 1
        };
    },
    computed: {
        showPagination() {
            return this.total > this.mvs.length;
        }
    },
    methods: {
        async loadMVs(offset = 0, limit = this.pageSize) {
            this.loading = true;
            const resp = await Api.getArtistMVs(this.artist.detail.id, offset, limit);
            this.mvs = resp.mvs.map(v => new Video(v));
            this.loading = false;
        },
        async handlePageChange(newPage) {
            this.currentPage = newPage;
            await this.loadMVs((this.currentPage - 1) * this.pageSize, this.pageSize);
            this.$emit('scroll');
        }
    },
    mounted() {
        this.loadMVs();
    },
    components: {
        VideoList,
        CenteredLoading
    }
};
</script>
