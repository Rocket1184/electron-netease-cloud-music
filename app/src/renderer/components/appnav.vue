<template>
    <div>
        <mu-appbar title="Electron Netease Cloud Music">
            <mu-icon-button icon="menu"
                            slot="left"
                            @click="toggleDrawer" />
            <mu-text-field icon="search"
                           class="appbar-search-field"
                           slot="right"
                           hintText="搜索歌曲、歌单、用户" />
        </mu-appbar>
        <mu-drawer :width="300"
                   :open="drawerOpen"
                   :docked="false"
                   @close="toggleDrawer()">
            <mu-list class="drawer-list-wrapper">
                <div class="drawer-header">
                    <div class="drawer-header-user-info">
                        <mu-avatar icon="music_note"
                                   :iconSize="40"
                                   :size="80" />
                        <p class="drawer-header-user-name">UserName</p>
                    </div>
                </div>
                <mu-list-item title="听歌排行">
                    <mu-icon slot="left"
                             value="equalizer" />
                </mu-list-item>
                <mu-list-item title="我的歌单">
                    <mu-icon slot="left"
                             value="library_music" />
                </mu-list-item>
                <mu-list-item title="本地音乐">
                    <mu-icon slot="left"
                             value="desktop_mac" />
                </mu-list-item>
                <mu-list-item title="应用设置">
                    <mu-icon slot="left"
                             value="settings" />
                </mu-list-item>
            </mu-list>
        </mu-drawer>
    </div>
</template>

<script>
export default {
    data() {
        return {
            drawerOpen: false
        };
    },
    methods: {
        toggleDrawer() {
            this.drawerOpen = !this.drawerOpen;
        }
    }
};
</script>

<style lang="less">
.appbar-search-field {
    color: #FFF;
    margin-bottom: 0;
    &.focus-state {
        color: #FFF;
    }
    .mu-text-field-hint {
        color: fade(#FFF, 54%);
    }
    .mu-text-field-input {
        color: #FFF;
    }
    .mu-text-field-focus-line {
        background-color: #FFF;
    }
}

.drawer-list-wrapper {
    padding-top: 0;
}

.drawer-header {
    position: relative;
    width: 100%;
    height: 200px;
    background-size: cover;
    background-image: url(../../assets/TealRedYellow.png);
    background-position-y: 50%;
}

.drawer-header::before {
    position: absolute;
    content: "cnt";
    color: transparent;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
}

.drawer-header-user-info {
    position: absolute;
    padding: 2rem;
    bottom: 0;
    left: 0;
}

.drawer-header-user-name {
    margin-top: 1rem;
    color: white;
    font-size: 2rem;
}
</style>
