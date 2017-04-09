export const mainCounter = state => state.counters.main;

export const userAvatarUrl = state => {
    return state.user.loginValid
        ? state.user.profile.avatarUrl
        : null;
};

export const userName = state => {
    return state.user.loginValid
        ? state.user.profile.nickname
        : '未登录';
};

export const userBkgUrl = state => {
    return state.user.loginValid
        ? state.user.profile.backgroundUrl
        : null;
};

export const playingMusic = state => {
    return {
        ...state.playing,
        picUrl: state.playing.album.picUrl,
        artist: Array.isArray(state.playing.artists)
            ? state.playing.artists.reduce((i, j) => `${i} / ${j ? '' : j.name}`, '')
            : state.playing.artists[0].name
    };
};
