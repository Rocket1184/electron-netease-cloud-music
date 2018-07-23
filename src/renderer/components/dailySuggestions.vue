<template>
    <mu-paper class="daily-suggestions"
        :z-depth="1">
        <div class="title">
            <p>{{dayNumber}}</p>
            <br>
            <p>每日歌曲推荐</p>
        </div>
        <div class="content">
            <template v-if="loginValid">
                <PlayAll :tracks="dailyList"></PlayAll>
                <TrackList :tracks="dailyList"></TrackList>
            </template>
            <div v-else
                class="tip">
                <mu-icon value="nature_people"
                    :size="128"></mu-icon>
                <p>登录后开启歌曲推荐 ：）</p>
            </div>
        </div>
    </mu-paper>
</template>

<script>
import { mapGetters } from 'vuex';

import { Track } from '@/util/models';
import PlayAll from './playAll.vue';
import TrackList from './trackList.vue';
import ApiRenderer from '@/util/apiRenderer';

export default {
    data() {
        return {
            dailyList: []
        };
    },
    computed: {
        ...mapGetters([
            'loginValid'
        ]),
        dayNumber() {
            return new Date().getDate();
        }
    },
    methods: {
        async getDailyList() {
            const resp = await ApiRenderer.getDailySuggestions();
            this.dailyList = resp.recommend.map(t => new Track(t));
        }
    },
    watch: {
        loginValid(val) {
            if (val) {
                this.getDailyList();
            } else {
                this.dailyList = [];
            }
        }
    },
    created() {
        if (this.loginValid) this.getDailyList();
    },
    components: {
        PlayAll,
        TrackList
    }
};
</script>

<style lang="less">
.daily-suggestions {
    width: 900px;
    min-height: 400px;
    display: grid;
    grid-template-columns: 2fr 7fr;
    .title {
        background-color: indianred;
        text-align: center;
        color: white;
        font-size: 24px;
        padding-top: 20px;
    }
    .content {
        .tip {
            color: grey;
            text-align: center;
            margin-top: 100px;
        }
    }
}
</style>
