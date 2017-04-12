<template>
    <mu-paper class="daily-suggestions">
        <div class="cell title">
            <p>{{dayNumber}}</p>
            <p>每日推荐</p>
        </div>
        <div class="cell content">
            <PlayList :list="dailyList" />
        </div>
    </mu-paper>
</template>

<script>
import { mapGetters } from 'vuex';

import PlayList from './playlist';
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
    components: {
        PlayList
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
        padding-top: 4em;
    }
    .content {
        flex: 7;
    }
}
</style>
