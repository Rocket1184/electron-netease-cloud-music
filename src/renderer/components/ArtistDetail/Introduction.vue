<template>
    <section class="intro resource">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else>
            <template v-if="intro.briefDesc">
                <h2 class="subhead">
                    <span class="mu-primary-color">&nbsp;</span>
                    <span>&nbsp;{{artist.detail.name}}简介</span>
                </h2>
                <p class="para">{{intro.briefDesc}}</p>
            </template>
            <CenteredTip v-else
                icon="cloud_off"
                tip="暂无介绍"></CenteredTip>
            <template v-for="i in intro.introduction">
                <h2 class="subhead"
                    :key="i.ti+'ti'">{{i.ti}}</h2>
                <p class="para"
                    :key="i.ti+'tx'">{{i.txt}}</p>
            </template>
        </template>
    </section>
</template>

<script>
import Api from '@/util/api';
import CenteredTip from '@/components/CenteredTip.vue';
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
        CenteredTip,
        CenteredLoading
    }
};
</script>
