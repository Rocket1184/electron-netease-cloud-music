<template>
    <mu-paper class="daily-suggestions">
        <div class="cell title">
            <p>{{dayNumber}}</p>
            <br>
            <p>每日歌曲推荐</p>
        </div>
        <div class="cell content">
            <TrackList :list="dailyList" />
        </div>
    </mu-paper>
</template>

<script>
import { mapGetters } from 'vuex';

import TrackList from './tracklist';
import ApiRenderer from '../util/apirenderer';

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
            this.dailyList = resp.recommend;
        }
    },
    watch: {
        loginValid: function (val) {
            if (val) this.getDailyList();
        }
    },
    created() {
        if (this.loginValid) this.getDailyList();
    },
    components: {
        TrackList
    }
};
</script>

<style lang="less">
.daily-suggestions {
    min-height: 400px;
    display: flex;
    .cell {
        flex-direction: row;
        flex-wrap: nowrap;
    }
    .title {
        flex: 2;
        background-color: indianred;
        text-align: center;
        color: white;
        font-size: 24px;
        padding-top: 2em;
    }
    .content {
        flex: 7;
    }
}
</style>
