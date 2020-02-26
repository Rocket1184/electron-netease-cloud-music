<template>
    <ListDetailLayout class="radio ncm-page"
        showBack>
        <template v-if="user.loginValid">
            <div class="mu-card-media">
                <div class="radio-header"></div>
                <div class="mu-card-media-title">
                    <div class="mu-card-title">
                        <span>私人 FM</span>
                        <mu-switch :inputValue="ui.radioMode"
                            @change="handleActivate"
                            color="secondary"></mu-switch>
                    </div>
                    <div class="mu-card-sub-title">找到只属于你的频率</div>
                </div>
            </div>
            <RadioSongList :tracks="radio.list"></RadioSongList>
        </template>
        <CenteredTip v-else
            icon="radio"
            tip="登录后开启私人 FM"></CenteredTip>
    </ListDetailLayout>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import RadioSongList from './RadioSongList.vue';
import CenteredTip from '@/components/CenteredTip.vue';
import ListDetailLayout from '@/components/ListDetailLayout.vue';

export default {
    computed: {
        ...mapState(['ui', 'radio', 'user'])
    },
    methods: {
        ...mapActions([
            'playAudio',
            'pauseAudio',
            'activateRadio',
            'updateUiTrack'
        ]),
        async handleActivate(val) {
            await this.activateRadio(val);
            await this.updateUiTrack();
            if (val === true) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        }
    },
    components: {
        RadioSongList,
        CenteredTip,
        ListDetailLayout
    }
};
</script>

<style lang="less">
.radio {
    .radio-header {
        height: 200px;
        background: linear-gradient(45deg, #959ca6, #e1dfd2, #a59d97);
        background-position: 50%, 50%;
    }
    .mu-card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .tracklist {
        .track-row {
            padding-left: 16px;
        }
    }
}
</style>
