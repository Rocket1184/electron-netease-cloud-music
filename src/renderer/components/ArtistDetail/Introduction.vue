<template>
    <section class="intro">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else>
            <p class="para">{{intro.briefDesc}}</p>
            <template v-for="i in intro.introduction">
                <mu-sub-header :key="i.ti+'ti'">{{i.ti}}</mu-sub-header>
                <p class="para"
                    :key="i.ti+'tx'">{{i.txt}}</p>
            </template>
        </template>
    </section>
</template>

<script>
import Api from '@/util/api';
import CenteredLoading from '@/components/CenteredLoading.vue';

export default {
    props: {
        artist: {
            required: true
        }
    },
    data() {
        return {
            intro: {},
            loading: true
        };
    },
    methods: {
        async loadIntro() {
            this.loading = true;
            const resp = await Api.getArtistIntro(this.artist.detail.id);
            this.intro = resp;
            this.loading = false;
        }
    },
    mounted() {
        this.loadIntro();
    },
    components: {
        CenteredLoading
    }
};
</script>
