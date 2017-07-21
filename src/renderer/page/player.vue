<template>
    <div class="song-detail">
        <div class="bkg"
             :style="styleAlbumImg"></div>
        <div :class="['disk', { play: !playing.paused }]">
            <div class="container">
                <div class="img"
                     :style="styleAlbumImg">
                    <div class="border">
                    </div>
                </div>
                <div class="needle"></div>
            </div>
        </div>
        <div class="info">
            <p class="name">{{playing.track.name}}</p>
            <p>
                歌手：
                <span class="artists">{{playing.track.artistName}}</span> 专辑：
                <span class="album">{{playing.track.album.name}}</span>
            </p>
            <div class="lyric">
                <div class="scroller"
                     :style="lyricScrollerStyle">
                    <template v-if="playing.lyrics.mlrc">
                        <p v-for="(line, index) in playing.lyrics.mlrc.lyrics"
                           class="line"
                           :key="index"
                           :class="{active: index == currentLyricIndex}"
                           :data-time="line.timestamp">
                            <span>{{line.content}}</span>
                            <br>
                            <span>{{line.trans}}</span>
                        </p>
                    </template>
                    <template v-else-if="playing.lyrics.lrc">
                        <p v-for="(line, index) in playing.lyrics.lrc.lyrics"
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
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            isActive: false,
            _audioEl: {},
            lyricElemMap: [],
            currentLyricIndex: -1
        };
    },
    computed: {
        ...mapGetters([
            'playing'
        ]),
        styleBlurImg() {
            // maybe useful later...
            return `background-image:url(http://music.163.com/api/img/blur/${this.playing.track.album.pic});`;
        },
        styleAlbumImg() {
            const len = window.devicePixelRatio * 220;
            return `background-image:url(${this.playing.track.album.picUrl}?param=${len}y${len});`;
        },
        lyricScrollerStyle() {
            if (this.lyricElemMap.length === 0 || this.currentLyricIndex === -1) {
                return 'transform: translateY(150px)';
            }
            const currentLyricElem = this.lyricElemMap[this.currentLyricIndex];
            const offset = 150 - currentLyricElem.offsetTop - currentLyricElem.clientHeight;
            return `transform: translateY(${offset}px);`;
        }
    },
    methods: {
        createLyricElemMap() {
            if (this.playing.lyrics.lrc) {
                this.lyricElemMap = Array.from(document.getElementsByClassName('line'));
                this.currentLyricIndex = -1;
            }
        }
    },
    watch: {
        'playing.track.lyrics': {
            deep: true,
            handler() {
                // query lyric elements after they are created
                this.$nextTick(() => this.createLyricElemMap());
            }
        }
    },
    created() {
        this._audioEl = document.getElementById('playerbar-audio');
        this._audioEl.ontimeupdate = ev => {
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
        };
    },
    mounted() {
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
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 1);
}

.ellipsis-text(@width: 200px) {
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
        transform: translate3d(0, 0, 0); // magic!!! this enables GPU acceleration!!!!
    }
    .disk {
        flex: 1;
        position: relative;
        transition: transform 25s;
        .container {
            width: 500px;
            position: absolute;
            margin: auto;
            right: 0;
            left: 0;
            transform: translate3d(0, 0, 0);
            .img {
                width: 220px;
                height: 220px;
                margin: 130px auto 0;
                background-size: cover;
                animation: disk-playing 25s linear infinite;
                animation-play-state: paused;
                .border {
                    right: 65px;
                    bottom: 65px;
                    width: 350px;
                    height: 350px;
                    background-image: url(../../../assets/img/disc.png);
                    background-size: contain;
                    position: relative;
                }
            }
            .needle {
                content: 'needle';
                color: transparent;
                position: absolute;
                top: -6px;
                left: 230px;
                width: 100px;
                height: 200px;
                background-image: url(../../../assets/img/needle.png);
                background-repeat: no-repeat;
                background-size: contain;
                transition: transform 0.5s;
                transform-origin: 15px 0;
                transform: rotate(-25deg);
            }
        }
    }
    .play {
        .container {
            .img {
                animation-play-state: running;
            }
            .needle {
                transform: rotate(0deg);
            }
        }
    }
    .info {
        flex: 1;
        padding: 10px 0;
        box-sizing: border-box;
        .name {
            .ellipsis-text(500px);
            font-size: 32px;
            margin: 8px 0;
        }
        .artists,
        .album {
            .ellipsis-text;
        }
        .lyric {
            height: 340px;
            overflow: hidden;
            margin-top: 20px;
            .scroller {
                transition: transform 0.7s;
                .line {
                    margin: 12px 0;
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
