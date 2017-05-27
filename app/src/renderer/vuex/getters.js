export const loginValid = state => state.user.loginValid;

export const userAvatarUrl = state => {
    return state.user.loginValid
        ? state.user.info.avatarUrl
        : null;
};

export const userName = state => {
    return state.user.loginValid
        ? state.user.info.nickname
        : '未登录';
};

export const userBkgUrl = state => {
    return state.user.loginValid
        ? state.user.info.bkgUrl
        : null;
};

export const userFavoriteList = state => {
    return state.user.loginValid
        ? state.user.playlist[0]
        : null;
};

export const playing = state => {
    const { list, currentIndex, quality, paused } = state.playlist;
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
