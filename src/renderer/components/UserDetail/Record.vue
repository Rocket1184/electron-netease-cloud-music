<template>
    <div class="user-record">
        <template v-if="recordVisible">
            <mu-sub-header>
                <a class="type"
                    :class="allClass"
                    @click="handleTypeChange('all')">所有时间</a>
                <a class="type"
                    :class="weekClass"
                    @click="handleTypeChange('week')">最近一周</a>
                <span class="statistics">累计听歌 {{ user.listenSongs }} 首</span>
            </mu-sub-header>
            <CenteredLoading v-if="loading"></CenteredLoading>
            <VirtualTrackList v-else
                :tracks="tracks"></VirtualTrackList>
        </template>
        <CenteredTip v-else
            icon="cloud_off"
            tip="由于对方的隐私设置，你无法查看 TA 的听歌排行"></CenteredTip>
    </div>
</template>

<script>
import Api from '@/api/ipc';
import { Track } from '@/util/models';

import VirtualTrackList from '@/components/TrackList/VirtualTrackList.vue';
import CenteredLoading from '@/components/CenteredLoading.vue';
import CenteredTip from '@/components/CenteredTip.vue';

export default {
    props: {
        user: {
            type: Object,
            required: true
        },
        isSelf: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false,
            all: [],
            week: [],
            type: 'all'
        };
    },
    computed: {
        recordVisible() {
            return this.isSelf || this.user.peopleCanSeeMyPlayRecord;
        },
        allClass() {
            return { active: this.type === 'all' };
        },
        weekClass() {
            return { active: this.type === 'week' };
        },
        tracks() {
            return this[this.type];
        }
    },
    methods: {
        async getPlayRecord() {
            this.loading = true;
            const res = await Api.getUserPlayRecord(this.user.profile.userId, this.type === 'week' ? 1 : 0);
            if (res.code === 200) {
                this[this.type] = (res.allData || res.weekData || []).map(r => new Track(r.song));
            }
            this.loading = false;
        },
        handleTypeChange(type) {
            this.type = type;
            if (this[this.type].length === 0) {
                this.getPlayRecord();
            }
        }
    },
    mounted() {
        if (!this.recordVisible) return;
        this.getPlayRecord();
    },
    components: {
        VirtualTrackList,
        CenteredLoading,
        CenteredTip
    }
};
</script>

<style lang="less">
.user-record {
    .mu-sub-header {
        padding: 0 8px 0 20px;
        display: flex;
        justify-content: flex-start;
    }
    .type {
        margin-right: 8px;
        cursor: pointer;
        &.active {
            font-weight: bold;
        }
        &:not(.active) {
            color: unset;
        }
    }
    .statistics {
        margin-left: auto;
    }
}
</style>
