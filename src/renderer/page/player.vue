<template>
    <div class="song-detail">
        <div class="bkg"
            :style="styleAlbumImg"></div>
        <div class="disk"
            :class="classAlbumDisk">
            <div class="img"
                :style="styleAlbumImg">
                <div class="border">
                </div>
            </div>
            <div class="needle"></div>
        </div>
        <div class="info">
            <span class="name">{{playing.track.name}}</span>
            <p class="producer">
                <span>歌手：</span>
                <span class="artists">{{playing.track.artistName}}</span>
                <span>专辑：</span>
                <span class="album">{{playing.track.album.name}}</span>
            </p>
            <div class="lyric">
                <div class="scroller"
                    :style="lyricScrollerStyle">
                    <template v-if="ui.lyric.mlrc">
                        <p v-for="(line, index) in ui.lyric.mlrc.lyrics"
                            class="line"
                            :key="index"
                            :class="{active: index == currentLyricIndex}"
                            :data-time="line.timestamp">
                            <span>{{line.content}}</span>
                            <br>
                            <span>{{line.trans}}</span>
                        </p>
                    </template>
                    <template v-else-if="ui.lyric.lrc">
                        <p v-for="(line, index) in ui.lyric.lrc.lyrics"
                            :key="index"
                            class="line"
                            :class="{active: index == currentLyricIndex}"
                            :data-time="line.timestamp">
                            <span>{{line.content}}</span>
                        </p>
                    </template>
                    <template v-else>
                        <p>暂无歌词</p>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { bkgImg, sizeImg, HiDpiPx } from '@/util/image';

export default {
    name: 'page-player',
    data() {
        return {
            isActive: false,
            /** @type {HTMLAudioElement} */
            audioEl: null,
            lyricElemMap: [],
            currentLyricIndex: -1
        };
    },
    computed: {
        ...mapState([
            'playlist',
            'ui'
        ]),
        ...mapGetters([
            'playing'
        ]),
        classAlbumDisk() {
            return { play: !this.playlist.paused };
        },
        styleAlbumImg() {
            return bkgImg(sizeImg(this.playing.track.album.picUrl, HiDpiPx(220)));
        },
        lyricScrollerStyle() {
            if (this.lyricElemMap.length === 0 || this.currentLyricIndex === -1) {
                return 'transform: translateY(164px)';
            }
            const currentLyricElem = this.lyricElemMap[this.currentLyricIndex];
            const offset = 150 - currentLyricElem.offsetTop - currentLyricElem.clientHeight;
            return `transform: translateY(${offset}px);`;
        }
    },
    methods: {
        listenAudioUpdate() {
            this.audioEl = document.getElementById('playerbar-audio');
            this.audioEl.addEventListener('timeupdate', ev => {
                // do nothing if element map is empty or compo not acitve
                // it's empty in case:
                // 1. no lyric for this track
                // 2. the component is mounted but not active yet e.g. it's in <keep-alive/> background
                if (!this.isActive || !this.lyricElemMap.length) return;
                // do not loop from 0 every time
                // loop form current index. if current index equals -1, loop from 0
                let loopStart = this.currentLyricIndex === -1 ? 0 : this.currentLyricIndex;
                // the process was darged backword, loop from 0
                if (ev.target.currentTime < +this.lyricElemMap[loopStart].getAttribute('data-time')) {
                    loopStart = 0;
                }
                // loop and find the smallest whose time larger than currentTime
                for (let i = loopStart; i < this.lyricElemMap.length; i++) {
                    if (ev.target.currentTime < +this.lyricElemMap[i].getAttribute('data-time')) {
                        this.currentLyricIndex = i - 1;
                        return;
                    }
                }
                // not found any, point to the last element
                this.currentLyricIndex = this.lyricElemMap.length - 1;
            });
            this.audioEl.addEventListener('ended', () => this.currentLyricIndex = -1);
        },
        createLyricElemMap() {
            if (this.ui.lyric.lrc) {
                this.lyricElemMap = Array.from(document.getElementsByClassName('line'));
            }
        }
    },
    watch: {
        ['ui.lyricSeq']: {
            handler() {
                // query lyric elements after they are created
                this.$nextTick(() => this.createLyricElemMap());
            }
        }
    },
    mounted() {
        this.listenAudioUpdate();
        this.createLyricElemMap();
    },
    activated() {
        this.isActive = true;
        if (!this.lyricElemMap.length) {
            this.createLyricElemMap();
        }
    },
    deactivated() {
        this.isActive = false;
    }
};
</script>

<style lang="less">
.shadow-text {
    color: white;
    text-shadow: 0 0 3px black, 0 2px 4px rgba(0, 0, 0, 0.5);
}

.ellipsis-text(@width: 175px) {
    display: inline-block;
    max-width: @width;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
}

.song-detail {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    .bkg {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: 80% 450px;
        background-repeat: no-repeat;
        background-position: 50% 0%;
        filter: blur(60px);
        opacity: 0.8;
        // magic!!! this enables GPU acceleration!!!!
        transform: translate3d(0, 0, 0);
    }
    .disk {
        flex: 1;
        position: relative;
        transition: transform 25s;
        .img {
            width: 220px;
            height: 220px;
            position: absolute;
            top: 130px;
            right: calc(~'50% - 110px');
            background-size: cover;
            animation: disk-playing 25s linear infinite;
            animation-play-state: paused;
            .border {
                right: 65px;
                bottom: 65px;
                width: 350px;
                height: 350px;
                background-image: url('~assets/img/disc.png');
                background-size: contain;
                position: relative;
            }
        }
        .needle {
            position: absolute;
            top: -6px;
            left: calc(~'50% - 20px');
            width: 100px;
            height: 200px;
            background-image: url('~assets/img/needle.png');
            background-repeat: no-repeat;
            background-size: contain;
            transition: transform 0.5s;
            transform-origin: 15px 0;
            transform: rotate(-25deg);
        }
    }
    .play {
        .img {
            animation-play-state: running;
        }
        .needle {
            transform: rotate(0deg);
        }
    }
    .info {
        flex: 1;
        & > * {
            // lyric needs padding, or its text-shadow would be cut off
            padding-left: 10px;
        }
        .name {
            .ellipsis-text(500px);
            font-size: 28px;
            margin-top: 18px;
        }
        .producer {
            span {
                display: inline-block;
            }
        }
        .artists {
            margin-right: 1em;
        }
        .artists,
        .album {
            .ellipsis-text;
        }
        .lyric {
            height: 340px;
            overflow: hidden;
            .scroller {
                transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                .line {
                    margin: 14px 0;
                }
                .active {
                    .shadow-text;
                }
            }
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
