<template>
    <section class="intro resource">
        <CenteredLoading v-if="loading"></CenteredLoading>
        <template v-else-if="hasDesc">
            <p v-if="intro.briefDesc"
                class="para">{{intro.briefDesc}}</p>
            <template v-for="i in intro.introduction">
                <h2 class="subhead"
                    :key="i.ti">{{i.ti}}</h2>
                <p class="para"
                    :key="i.ti + 't'">{{i.txt}}</p>
            </template>
        </template>
        <CenteredTip v-else
            icon="cloud_off"
            tip="暂无介绍"></CenteredTip>
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
    computed: {
        hasDesc() {
            const { briefDesc, introduction } = this.intro;
            return (briefDesc && briefDesc.length > 0) || (introduction && introduction.length > 0);
        }
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
