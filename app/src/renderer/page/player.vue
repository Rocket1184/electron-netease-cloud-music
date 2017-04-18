<template>
    <div class="song-detail">
        <div class="bkg"
             :style="styleBkgImg"></div>
        <div :class="diskClass">
            <div class="img"
                 :style="styleBkgImg">
                <div class="border">
                </div>
            </div>
            <div class="needle"></div>
        </div>
        <div class="info">
            <h1>{{playing.name}}</h1>
            <p>歌手：{{playing.artist}} 专辑：{{playing.album.name}}</p>
            <div class="lyric">
    
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
        styleBkgImg() {
            return `background-image:url(${this.playing.picUrl});`;
        },
        diskClass() {
            return [
                'disk',
                this.playing.playing ? 'play' : ''
            ];
        }
    },
    created() {
        this.id = this.playing.id;
    }
};
</script>

<style lang="less">
.song-detail {
    height: 500px;
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
        filter: blur(80px);
    }
    .disk {
        flex: 1;
        position: relative;
        transition: transform 25s;
        .img {
            width: 220px;
            height: 220px;
            margin: 130px auto 0;
            background-size: cover;
            border-radius: 50%;
            animation: disk-playing 25s linear infinite;
            animation-play-state: paused;
            .border {
                right: 65px;
                bottom: 65px;
                width: 350px;
                height: 350px;
                background-image: url(../../../assets/img/disc.png);
                background-size: cover;
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
        padding: 10px 0;
        box-sizing: border-box;
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
