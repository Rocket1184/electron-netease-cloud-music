export const loginValid = state => state.user.loginValid;

export const user = state => {
    const { id, avatarUrl, nickname, bkgUrl } = state.user.info;
    const { playlist } = state.user;
    if (state.user.loginValid) return {
        id,
        avatarUrl,
        name: nickname,
        bkgUrl,
        favoriteList: playlist[0],
        playlist
    };
    return {};
};

export const playing = state => {
    const quality = state.settings.bitRate;
    const { list, currentIndex, paused } = state.playlist;
    const track = list[currentIndex];
    return {
        paused,
        track,
        url: track.urls[quality]
    };
};

export const playlist = state => {
    return state.playlist;
};

export const playLoopMode = state => {
    return state.playlist.loopMode;
};
