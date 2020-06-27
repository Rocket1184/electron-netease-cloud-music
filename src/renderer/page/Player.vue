<template>
    <div class="player ncm-page"
        :class="{ dark: this.dark }">
        <div class="bkg">
            <canvas ref="cvs"
                width="1000"
                height="600"></canvas>
        </div>
        <div class="phonograph"
            :class="{ play: !this.ui.paused }">
            <img class="stylus"
                src="~assets/img/needle.webp"
                width="100"
                height="142.5">
            <div class="vinyl">
                <img :src="albumImgSrc"
                    class="cover"
                    width="220"
                    height="220">
                <img src="~assets/img/disc.webp"
                    class="border"
                    width="350"
                    height="350">
            </div>
            <div v-if="playing.id"
                class="action">
                <mu-button v-if="isDjRadioProgram"
                    flat
                    small
                    :color="threadLiked ? 'primary' : 'black'"
                    :disabled="threadLiked === null"
                    @click="handleProgramLike">
                    <mu-icon left
                        :size="18"
                        value="thumb_up"></mu-icon>
                    <span>{{ threadLiked ? '已赞' : '赞' }}</span>
                </mu-button>
                <mu-button v-else
                    flat
                    small
                    color="black"
                    @click="handleCollect">
                    <mu-icon left
                        :size="18"
                        value="bookmark_border"></mu-icon>
                    <span>收藏</span>
                </mu-button>
                <mu-button flat
                    small
                    color="black"
                    :to="commentRoute"
                    replace>
                    <mu-icon left
                        :size="18"
                        value="comment"></mu-icon>
                    <span>评论 ({{ commentCount }})</span>
                </mu-button>
                <mu-button flat
                    small
                    color="black"
                    @click="toggleShare">
                    <mu-icon left
                        :size="18"
                        value="share"></mu-icon>
                    <span>分享</span>
                </mu-button>
            </div>
        </div>
        <div class="info">
            <div class="title">
                <span class="name">{{ playing.name }}</span>
                <mu-button v-if="playing.mv"
                    icon
                    small
                    color="primary"
                    class="btn-mv"
                    title="查看 MV"
                    :to="{ name: 'video', params: { id: playing.mv } }"
                    replace>
                    <mu-icon value="music_video"></mu-icon>
                </mu-button>
            </div>
            <p class="source">
                <template v-if="isDjRadioProgram">
                    <span>电台：</span>
                    <router-link class="source-link"
                        :to="{ name: 'djradio', params: { id: playing.source.id } }"
                        replace>{{ playing.source.djradio.radio.name }}</router-link>
                </template>
                <template v-else>
                    <span v-if="playing.artists"
                        class="source-artist">
                        <span>歌手：</span>
                        <template v-for="(ar, index) in playing.artists">
                            <span v-if="index !== 0"
                                :key="'sep' + index"
                                class="sep">/</span>
                            <router-link v-if="ar.id"
                                :key="ar.id"
                                class="source-link"
                                :to="{ name: 'artist', params: { id: ar.id } }"
                                replace>{{ ar.name }}</router-link>
                            <span v-else
                                :key="'ar' + index">{{ ar.name }}</span>
                        </template>
                    </span>
                    <span v-if="playing.album"
                        class="source-album">
                        <span>专辑：</span>
                        <router-link v-if="playing.album.id"
                            class="source-link"
                            :to="{ name: 'album', params: { id: playing.album.id } }"
                            replace>{{ playing.album.name }}</router-link>
                        <span v-else>{{ playing.album.name }}</span>
                    </span>
                </template>
            </p>
            <div v-if="isDjRadioProgram"
                class="description">
                <div class="scroller">
                    <div>{{ playing.source.djradio.description }}</div>
                </div>
            </div>
            <div v-else
                class="lyric">
                <div v-if="playing.id"
                    class="control">
                    <mu-button flat
                        small
                        color="black"
                        @click="handleLyricRefresh">
                        <mu-icon left
                            value="refresh"></mu-icon>
                        <span>刷新歌词</span>
                    </mu-button>
                </div>
                <div v-if="ui.lyricLoading"
                    class="mask">
                    <p>歌词加载中 ...</p>
                </div>
                <div v-show="!ui.lyricLoading"
                    class="scroller-wrapper">
                    <div class="scroller"
                        :style="lyricScrollerStyle">
                        <template v-if="ui.lyric.mlrc || ui.lyric.lrc">
                            <div v-for="(line, index) of (ui.lyric.mlrc || ui.lyric.lrc).lyrics"
                                ref="lyric"
                                class="line"
                                :key="index"
                                :class="{ active: index == currentLyricIndex }"
                                :data-time="line.timestamp"
                                v-text="line.content + '\n' + (line.trans || '')"></div>
                        </template>
                        <template v-else-if="ui.lyric.txtLyric">
                            <div class="txt"
                                v-text="ui.lyric.txtLyric"></div>
                        </template>
                        <template v-else>
                            <p>暂无歌词</p>
                        </template>
                        <template v-if="ui.lyric.lyricUser">
                            <div class="contributors">
                                <div>
                                    <span>歌词贡献者：</span>
                                    <router-link class="contributor"
                                        replace
                                        :to="{ name: 'user', params: { id: ui.lyric.lyricUser.userid } }">
                                        {{ ui.lyric.lyricUser.nickname }}
                                    </router-link>
                                </div>
                                <div v-if="ui.lyric.transUser">
                                    <span>翻译贡献者：</span>
                                    <router-link class="contributor"
                                        replace
                                        :to="{ name: 'user', params: { id: ui.lyric.transUser.userid } }">
                                        {{ ui.lyric.transUser.nickname }}
                                    </router-link>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <mu-dialog width="500"
            title="分享"
            dialog-class="share-dlg"
            :open.sync="dlgShareOpen">
            <div class="share-content">
                <div ref="shareText">{{ shareText }}</div>
            </div>
            <template #actions>
                <mu-button flat
                    color="primary"
                    @click="toggleShare">关闭</mu-button>
            </template>
        </mu-dialog>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import Api from '@/api/ipc';
import { workerExecute } from '@/worker/message';
import { sizeImg, HiDpiPx } from '@/util/image';

import discDefault from 'assets/img/disc_default.webp';
import defaultCoverImg from 'assets/img/cover_default.webp';

export default {
    name: 'player',
    data() {
        return {
            dark: false,
            isActive: false,
            canvasImageId: -1,
            threadInfoId: -1,
            threadLiked: false,
            commentCount: '...',
            currentLyricIndex: -1,
            dlgShareOpen: false
        };
    },
    computed: {
        ...mapState(['ui', 'user', 'settings']),
        ...mapGetters(['playing']),
        themeCompensation() {
            return this.settings.themeVariety === 'light' ? 25 : 4.8;
        },
        isDjRadioProgram() {
            const { source = {} } = this.playing;
            return (source && source.djradio);
        },
        albumImgSrc() {
            if (this.ui.coverImgSrc) {
                return sizeImg(this.ui.coverImgSrc, HiDpiPx(220));
            }
            return discDefault;
        },
        commentRoute() {
            const { id, source = {} } = this.playing;
            return {
                name: 'comment',
                params: this.isDjRadioProgram
                    ? { type: 'dj', id: source.djradio.id }
                    : { type: 'song', id }
            };
        },
        shareText() {
            if (!this.playing.id) return '';
            if (this.isDjRadioProgram) {
                const { id, radio } = this.playing.source.djradio;
                return `分享 ${radio.name} 的节目 《${this.playing.name}》：https://music.163.com/program/${id}`;
            }
            const { id, name, artistName } = this.playing;
            return `分享 ${artistName} 的单曲 《${name}》：https://music.163.com/song/${id}`;
        },
        lyricScrollerStyle() {
            if (typeof this.ui.lyric.txtLyric === 'string') {
                // non-scrollable lyric
                return 'height: 100%; overflow: auto;';
            }
            if (this.currentLyricIndex === -1 || !this.$refs.lyric || this.$refs.lyric.length === 0) {
                // initial state
                return 'transform: translateY(164px)';
            }
            const currentLyricElem = this.$refs.lyric[this.currentLyricIndex];
            const offset = 150 - currentLyricElem.offsetTop - currentLyricElem.clientHeight;
            return `transform: translateY(${offset}px);`;
        }
    },
    methods: {
        ...mapActions([
            'updateUiLyric',
            'toggleCollectPopup'
        ]),
        listenAudioUpdate() {
            /** @type {HTMLAudioElement} */
            const audio = document.getElementById('playerbar-audio');
            audio.addEventListener('timeupdate', ev => {
                // do nothing if element map is empty or compo not acitve
                // it's empty in case:
                // 1. no lyric for this track
                // 2. the component is mounted but not active yet e.g. it's in <keep-alive/> background
                if (!this.isActive || !this.$refs.lyric || !this.$refs.lyric.length) return;
                // do not loop from 0 every time
                // loop form current index. if current index equals -1, loop from 0
                let loopStart = this.currentLyricIndex === -1 ? 0 : this.currentLyricIndex;
                // the process was darged backword, loop from 0
                if (ev.target.currentTime < +this.$refs.lyric[loopStart].dataset.time) {
                    loopStart = 0;
                }
                // loop and find the smallest whose time larger than currentTime
                for (let i = loopStart; i < this.$refs.lyric.length; i++) {
                    if (ev.target.currentTime < +this.$refs.lyric[i].dataset.time) {
                        this.currentLyricIndex = i - 1;
                        return;
                    }
                }
                // not found any, point to the last element
                this.currentLyricIndex = this.$refs.lyric.length - 1;
            });
        },
        paintBkgCanvas() {
            this.canvasImageId = this.playing.id;
            let src;
            const size = HiDpiPx(64);
            if (this.ui.coverImgSrc) {
                src = sizeImg(this.ui.coverImgSrc, size);
            } else {
                src = defaultCoverImg;
            }
            const w = 1000;
            const h = 600;
            /** @type {CanvasRenderingContext2D} */
            const ctx = this.$refs.cvs.getContext('2d');
            ctx.globalAlpha = 0.9;
            ctx.filter = 'blur(60px) brightness(0.75)';
            fetch(src).then(r => r.blob()).then(b => {
                this.determineBrightness(b);
                return createImageBitmap(b);
            }).then(bm => {
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(bm, 0, 0, size, size, -30, -30, w + 60, h + 60);
            });
        },
        async determineBrightness(bms) {
            const b = await workerExecute('determineBrightness', bms);
            // globalAlpha = 0.9;  brightness(0.75)
            const brightness = (b * 0.9 * 0.75 + this.themeCompensation);
            this.dark = brightness < 102;
        },
        async refreshThreadInfo() {
            const { id, source = {} } = this.playing;
            if (!id) return;
            this.threadInfoId = id;
            this.threadLiked = null;
            this.commentCount = '...';
            const thread = source.djradio ? `A_DJ_1_${source.djradio.id}` : `R_SO_4_${id}`;
            const resp = await Api.getCommentThreadInfoE(thread);
            if (resp.code === 200) {
                this.threadLiked = resp.liked;
                this.commentCount = resp.commentCount;
            }
        },
        handleLyricRefresh() {
            this.updateUiLyric({ ignoreCache: true });
        },
        async handleProgramLike() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            const thread = `A_DJ_1_${this.playing.source.djradio.id}`;
            const shouldLike = !this.threadLiked;
            this.threadLiked = null;
            let resp;
            if (this.threadLiked) {
                resp = await Api.unlikeResourceE(thread);
            } else {
                resp = await Api.likeResourceE(thread);
            }
            if (resp.code === 200) {
                this.threadLiked = shouldLike;
            }
        },
        handleCollect() {
            if (!this.user.loginValid) {
                this.$toast.message('汝还没有登录呀      (눈‸눈)');
                return;
            }
            if (!this.playing.id) {
                this.$toast.message('究竟想收藏什么呢    (｡ŏ_ŏ)');
                return;
            }
            this.toggleCollectPopup(this.playing.id);
        },
        toggleShare() {
            this.dlgShareOpen = !this.dlgShareOpen;
            if (this.dlgShareOpen) this.$nextTick(() => {
                /** @type {HTMLDivElement} */
                const node = this.$refs.shareText;
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(node);
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                selection.removeAllRanges();
                this.$toast.message('已复制分享内容到粘贴版');
            });
        }
    },
    watch: {
        ['playing.id']() {
            if (!this.isActive) return;
            this.refreshThreadInfo();
        },
        ['ui.coverImgSrc']() {
            if (!this.isActive) return;
            this.paintBkgCanvas();
        },
        ['settings.themeVariety']() {
            this.paintBkgCanvas();
        },
        ['ui.lyric']() {
            // reset lyric position
            this.currentLyricIndex = -1;
        }
    },
    mounted() {
        this.paintBkgCanvas();
        this.refreshThreadInfo();
        this.listenAudioUpdate();
    },
    activated() {
        this.isActive = true;
        if (this.canvasImageId !== this.playing.id) {
            this.paintBkgCanvas();
        }
        if (this.threadInfoId !== this.playing.id) {
            this.refreshThreadInfo();
        }
    },
    deactivated() {
        this.isActive = false;
    }
};
</script>

<style lang="less">
.ellipsis-text(@width: 175px) {
    display: inline-block;
    max-width: @width;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
}

.player {
    color: black;
    display: flex;
    flex-direction: row;
    .bkg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        canvas {
            width: 100%;
            height: 100%;
        }
    }
    .phonograph,
    .info {
        z-index: 1;
        flex-grow: 1;
        flex-basis: 0;
    }
    .phonograph {
        display: flex;
        flex-direction: column;
        align-items: center;
        .stylus,
        .vinyl {
            pointer-events: none;
            user-select: none;
        }
        .stylus {
            z-index: 2;
            margin: -6px 0 -74px 74px;
            transition: transform 0.5s;
            transform-origin: 15px 0;
            transform: rotate(-25deg);
        }
        .vinyl {
            position: relative;
            will-change: transform;
            animation: disk-playing 25s linear infinite;
            animation-play-state: paused;
            .cover {
                margin: 65px;
            }
            .border {
                position: absolute;
                top: 0;
                left: 0;
            }
        }
        .action {
            margin-top: 16px;
            display: flex;
        }
        &.play {
            .stylus {
                transform: rotate(0deg);
            }
            .vinyl {
                animation-play-state: running;
            }
        }
    }
    .info {
        .title,
        .source,
        .scroller-wrapper {
            // lyric needs padding, or its text-shadow would be cut off
            padding-left: 6px;
        }
        .title {
            margin-top: 16px;
            display: flex;
            align-items: center;
            .name {
                .ellipsis-text(calc(~'50vw - 48px'));
                font-size: 26px;
            }
            .btn-mv {
                margin-left: 4px;
            }
        }
        .source {
            margin: 16px 0 24px;
            .source-artist {
                margin-inline-end: 16px;
            }
            .source-album {
                white-space: nowrap;
            }
            .sep {
                margin: 0 4px;
            }
            .source-link {
                .ellipsis-text;
                color: unset;
                user-select: text;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
        .description {
            height: 340px;
            position: relative;
            margin: 0 40px 0 6px;
            .scroller {
                height: 100%;
                overflow-y: auto;
                white-space: pre-wrap;
            }
        }
        .lyric {
            height: 340px;
            position: relative;
            .control {
                position: absolute;
                bottom: 0;
                z-index: 0;
                opacity: 0;
                transition: 0.5s opacity;
            }
            .mask {
                height: 100%;
                display: flex;
                align-items: center;
            }
            .scroller-wrapper {
                height: 100%;
                overflow: hidden;
                // transition: 0.5s mask-image;
                .scroller {
                    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    .line {
                        margin: 14px 0;
                        white-space: pre-wrap;
                    }
                    .active {
                        color: white;
                        text-shadow: 0 0 4px black, 0 2px 4px rgba(0, 0, 0, 0.7);
                    }
                    .txt {
                        margin-bottom: 84px;
                        white-space: pre-wrap;
                    }
                    .contributors {
                        margin-top: 56px;
                    }
                    .contributor {
                        color: inherit;
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }
            }
            &:hover {
                .scroller-wrapper {
                    mask-image: linear-gradient(to top, transparent 32px, #000 82px),
                        linear-gradient(to left, #000 10px, transparent 10px, transparent);
                    -webkit-mask-image: linear-gradient(to top, transparent 32px, #000 82px),
                        linear-gradient(to left, #000 10px, transparent 10px, transparent);
                }
                .control {
                    z-index: 1;
                    opacity: 1;
                }
            }
        }
    }
}

.player.dark {
    .phonograph .mu-button-wrapper {
        color: #eee;
    }
    .info {
        .title,
        .source,
        .control .mu-button-wrapper {
            color: #eee;
        }
        .lyric,
        .description {
            color: rgba(255, 255, 255, 0.6);
        }
    }
}

@keyframes disk-playing {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
