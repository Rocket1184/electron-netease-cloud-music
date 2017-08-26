<template>
    <mu-paper class="daily-suggestions">
        <div class="cell title">
            <p>{{dayNumber}}</p>
            <br>
            <p>每日歌曲推荐</p>
        </div>
        <div class="cell content">
            <trackList v-if="loginValid"
                :list="dailyList"></trackList>
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

import { Track } from '../util/models';
import trackList from './trackList';
import ApiRenderer from '../util/apiRenderer';

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
        trackList
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
        padding-top: 20px;
    }
    .content {
        flex: 7;
        .tip {
            color: grey;
            text-align: center;
            margin-top: 100px;
        }
    }
}
</style>
