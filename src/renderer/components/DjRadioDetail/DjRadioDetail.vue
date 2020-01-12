<template>
    <div class="album-detail djradio-detail">
        <div class="header">
            <img :src="coverSrc"
                class="cover">
            <div class="side">
                <div class="info">
                    <div class="name">{{djradio.name}}</div>
                    <div class="creation-info">
                        <router-link class="creator"
                            tag="div"
                            :to="{ name: 'user', params: { id: djradio.dj.userId } }">
                            <mu-avatar class="avatar">
                                <img :src="creatorAvatarSrc">
                            </mu-avatar>
                            <span class="creator-name">{{djradio.dj.nickname}}</span>
                        </router-link>
                        <span class="create-time  mu-item-after-text">创建于 {{createTime}}</span>
                    </div>
                </div>
                <div class="actions">
                    <mu-button flat
                        small
                        @click="handlePlayAll"
                        :disabled="programsLoading || djradio.programCount <= 0">
                        <mu-icon left
                            value="play_circle_outline"></mu-icon>
                        <span>{{btnPlayText}}</span>
                    </mu-button>
                    <mu-button flat
                        small
                        @click="handleSubscribe">
                        <mu-icon left
                            :color="shouldSubscribed ? 'amber' : ''"
                            :value="shouldSubscribed ? 'star' : 'star_border'"></mu-icon>
                        <span>{{btnSubscribeText}}</span>
                    </mu-button>
                </div>
                <div class="intro">
                    <mu-list dense
                        toggle-nested>
                        <mu-list-item button
                            nested
                            :open="descOpen"
                            @click="descOpen = !descOpen">
                            <mu-list-item-title>电台内容简介</mu-list-item-title>
                            <mu-list-item-action>
                                <mu-icon class="toggle-icon"
                                    size="24"
                                    value="keyboard_arrow_down"></mu-icon>
                            </mu-list-item-action>
                            <template #nested>
                                <mu-list-item-content>
                                    <p class="description">{{djradioDesc}}</p>
                                </mu-list-item-content>
                            </template>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </div>
        <div class="tracks">
            <mu-sub-header>节目</mu-sub-header>
            <mu-divider></mu-divider>
            <CenteredLoading v-if="programsLoading"></CenteredLoading>
            <DjRadioProgramList v-else
                ref="programList"
                :programs="programs"
                :total="djradio.programCount"></DjRadioProgramList>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getDjRadioProgram } from '@/api/typed';

import CenteredLoading from '../CenteredLoading.vue';
import DjRadioProgramList from './DjRadioProgramList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

export default {
    props: {
        djradio: {
            required: true
        }
    },
    data() {
        return {
            shouldSubscribed: null,
            subsCntOffset: 0,
            descOpen: false,
            programsLoading: false,
            programs: []
        };
    },
    computed: {
        ...mapState(['user']),
        creatorAvatarSrc() {
            return sizeImg(this.djradio.dj.avatarUrl, HiDpiPx(40));
        },
        coverSrc() {
            return sizeImg(this.djradio.picUrl, HiDpiPx(160));
        },
        createTime() {
            return shortDate(this.djradio.createTime);
        },
        btnPlayText() {
            const n = this.programs.length || this.djradio.programCount;
            return `播放全部 (${n})`;
        },
        btnSubscribeText() {
            const t = this.shouldSubscribed ? '已订阅' : '订阅';
            const n = this.djradio.subCount + this.subsCntOffset;
            return `${t} (${n})`;
        },
        djradioDesc() {
            return this.djradio.desc || '暂无';
        }
    },
    methods: {
        ...mapActions([
            'subscribeDjRadio',
            'unsubscribeDjRadio'
        ]),
        async getPrograms() {
            this.programsLoading = true;
            this.programs = await getDjRadioProgram(this.djradio.id, 500);
            this.programsLoading = false;
        },
        async handlePlayAll() {
            this.$refs.programList.playAll();
        },
        async handleSubscribe() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (this.shouldSubscribed) {
                try {
                    await this.unsubscribeDjRadio(this.djradio);
                    this.shouldSubscribed = false;
                    this.subsCntOffset--;
                } catch (e) {
                    this.$toast.message(`取消订阅失败 ●﹏● ： ${e.code}`);
                }
                return;
            }
            try {
                await this.subscribeDjRadio(this.djradio);
                this.shouldSubscribed = true;
                this.subsCntOffset++;
            } catch (e) {
                this.$toast.message(`订阅电台失败 ●﹏● ： ${e.code}`);
            }
        }
    },
    created() {
        this.shouldSubscribed = this.djradio.subed;
        this.getPrograms();
    },
    components: {
        CenteredLoading,
        DjRadioProgramList
    }
};
</script>

<style lang="less">
.djradio-detail {
    .centered-loading {
        margin-top: 60px;
    }
}
</style>
