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
            <CenteredLoading v-if="programs.length === 0 && programsLoading"></CenteredLoading>
            <DjRadioProgramList v-else
                :programs="programs"
                :total="realProgramsCount || djradio.programCount"
                @loadAll="loadAllPrograms"></DjRadioProgramList>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import throttle from 'lodash/throttle';

import { getDjRadioProgram } from '@/api/typed';

import CenteredLoading from '../CenteredLoading.vue';
import DjRadioProgramList from './DjRadioProgramList.vue';
import { sizeImg, HiDpiPx } from '@/util/image';
import { shortDate } from '@/util/formatter';

export default {
    props: {
        /** @type {Vue.PropOptions<Models.DjRadio>} */
        djradio: {
            required: true
        }
    },
    data() {
        return {
            shouldSubscribed: null,
            subsCntOffset: 0,
            descOpen: false,
            realProgramsCount: null,
            programsLoading: false,
            programs: []
        };
    },
    computed: {
        /** @returns {import('@/store/modules/user').State} */
        user() { return this.$store.state.user; },
        /** @returns {string} */
        creatorAvatarSrc() {
            return sizeImg(this.djradio.dj.avatarUrl, HiDpiPx(40));
        },
        /** @returns {string} */
        coverSrc() {
            return sizeImg(this.djradio.picUrl, HiDpiPx(160));
        },
        /** @returns {string} */
        createTime() {
            return shortDate(this.djradio.createTime);
        },
        /** @returns {string} */
        btnSubscribeText() {
            const t = this.shouldSubscribed ? '已订阅' : '订阅';
            const n = this.djradio.subCount + this.subsCntOffset;
            return `${t} (${n})`;
        },
        /** @returns {string} */
        djradioDesc() {
            return this.djradio.desc || '暂无';
        }
    },
    methods: {
        ...mapActions([
            'subscribeDjRadio',
            'unsubscribeDjRadio'
        ]),
        async getPrograms(offset = 0, limit = 100) {
            this.programsLoading = true;
            const programs = await getDjRadioProgram(this.djradio.id, limit, offset);
            if (programs.length > 0) {
                this.programs = this.programs.concat(programs);
            }
            this.programsLoading = false;
            return programs.length;
        },
        async loadAllPrograms(resolve) {
            while (this.programs.length < this.djradio.programCount) {
                const cnt = await this.getPrograms(this.programs.length, 500);
                if (cnt <= 0) break;
            }
            // real `programs.length` is smaller than `programCount` sometimes
            if (this.djradio.programCount !== this.programs.length) {
                this.realProgramsCount = this.programs.length;
            }
            resolve();
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
        },
        handleScroll() {
            const { clientHeight, scrollHeight, scrollTop } = this.$el.parentElement;
            if (scrollHeight - clientHeight - scrollTop > 10) return;
            if (this.programs.length >= this.djradio.programCount) return;
            this.getPrograms(this.programs.length);
        }
    },
    created() {
        this.shouldSubscribed = this.djradio.subed;
        this.getPrograms();
    },
    mounted() {
        this.scrollElm = this.$el.parentElement;
        this.handleScrollThrottled = throttle(this.handleScroll, 200);
        this.scrollElm.addEventListener('scroll', this.handleScrollThrottled, { passive: true });
    },
    beforeDestroy() {
        this.scrollElm.removeEventListener('scroll', this.handleScrollThrottled);
        this.scrollElm = null;
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
