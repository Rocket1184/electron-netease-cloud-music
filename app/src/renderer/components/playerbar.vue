<template>
    <mu-paper class="player-bar-wrapper"
              :zDepth="2">
        <div class="cell">
            <img :src="getImgAt(64)"
                 :srcset="`${getImgAt(80)} 1.25x, ${getImgAt(96)} 1.5x, ${getImgAt(128)} 2x`">
        </div>
        <div class="cell info">
            <span class="song-name">{{songName}}</span>
            <span class="artist-name">{{artistName}}</span>
            <div class="quick-actions">
                <mu-icon-button tooltip="喜欢"
                                tooltipPosition="top-center"
                                touch
                                :iconClass="isFavorite && 'favorite'"
                                :icon="isFavorite? 'favorite' :'favorite_border'" />
                <mu-icon-button tooltip="收藏到歌单"
                                tooltipPosition="top-center"
                                touch
                                icon="photo_filter" />
                <mu-icon-button tooltip="播放列表"
                                tooltipPosition="top-center"
                                touch
                                icon="view_list" />
            </div>
            <div class="progress">
                <mu-slider v-model="songProgress"
                           class="silder" />
                <span class="text">{{timeCurrent|time}} / {{timeTotal|time}}</span>
            </div>
        </div>
        <div class="cell control">
            <mu-float-button icon="skip_previous"
                             mini
                             class="button"
                             color="#FFF" />
            <mu-float-button icon="play_arrow"
                             class="button"
                             color="#FFF" />
            <mu-float-button icon="skip_next"
                             mini
                             class="button"
                             color="#FFF" />
        </div>
    </mu-paper>
</template>

<script>
export default {
    data() {
        return {
            songName: '天ノ弱',
            artistName: 'GUMI / 164',
            timeCurrent: 50,
            timeTotal: 100,
            isFavorite: true,
            imgSrc: 'http://p4.music.126.net/z5n1fddhag63zGKrqlEo2g==/7920881766765179.jpg'
        };
    },
    methods: {
        getImgAt(size) {
            return `${this.imgSrc}?param=${size}y${size}`;
        }
    },
    filters: {
        time(value) {
            const dt = new Date(value * 1000);
            const h = dt.getUTCHours();
            const m = dt.getMinutes();
            const s = dt.getSeconds();
            return `${h ? `${h}:` : ''}${m}:${s}`;
        }
    },
    computed: {
        songProgress: {
            get() {
                return 100 * this.timeCurrent / this.timeTotal;
            },
            set(value) {
                this.timeCurrent = this.timeTotal * value / 100;
            }
        }
    }
};
</script>

<style lang="less">
.player-bar-wrapper {
    font-size: 0;
    height: 64px;
    .cell {
        vertical-align: top;
        height: 100%;
        display: inline-block;
    }
    .info {
        position: relative;
        font-size: 14px;
        padding: 10px;
        width: calc(~"100% - 244px");
        .artist-name {
            margin-left: 14px;
            color: dimgrey;
        }
        .quick-actions {
            position: absolute;
            top: 0;
            right: 0;
            .favorite {
                color: red;
            }
        }
        .progress {
            padding-top: 8px;
            display: flex;
            .silder {
                flex: 100;
                flex-grow: 1;
            }
            .text {
                flex: 1;
                max-width: 120px;
                padding-left: 10px;
            }
        }
    }
    .control {
        width: 180px;
        padding: 4px;
        .button {
            margin-left: 10px;
            display: inline-block;
            vertical-align: middle;
            box-shadow: transparent 0 0 0;
        }
    }
}
</style>
