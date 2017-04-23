<template>
    <div class="song-detail">
        <div class="bkg"
             :style="styleAlbumImg"></div>
        <div :class="['disk', { play: playing.playing }]">
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
            <p class="name">{{playing.name}}</p>
            <p>
                歌手：<span class="artists">{{playing.artist}}</span> 专辑：
                <span class="album">{{playing.album.name}}</span>
            </p>
            <div class="lyric">
                <template v-if="playing.lyrics.mlrc">
                    <template v-for="line in playing.lyrics.mlrc.lyrics">
                        <p class="line">
                            <span>{{line.content}}</span>
                            <br>
                            <span>{{line.trans}}</span>
                        </p>
                    </template>
                </template>
                <template v-else-if="playing.lyrics.lrc">
                    <template v-for="line in playing.lyrics.lrc.lyrics">
                        <p class="line">
                            <span>{{line.content}}</span>
                        </p>
                    </template>
                </template>
                <template v-else>
                    <p>暂无歌词</p>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            id: null
        };
    },
    computed: {
        ...mapGetters({
            playing: 'playingMusic'
        }),
        styleBlurImg() {
            // maybe useful later...
            return `background-image:url(http://music.163.com/api/img/blur/${this.playing.album.pic});`;
        },
        styleAlbumImg() {
            const len = window.devicePixelRatio * 220;
            return `background-image:url(${this.playing.picUrl}?param=${len}y${len});`;
        }
    }
};
</script>

<style lang="less">
.shadow-text {
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8),
    0px 0px 2px rgba(0, 0, 0, 0.5);
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
        filter: blur(60px) opacity(0.7);
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
            font-size: 32px;
            margin: 8px 0;
        }
        .artists,
        .album {
            .ellipsis-text;
        }
        .lyric {
            height: 400px;
            overflow: scroll;
            .line {
                margin: 12px 0;
            }
            .active {
                .shadow-text;
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
