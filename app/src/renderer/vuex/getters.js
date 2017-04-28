export const loginValid = state => state.user.loginValid;

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
    const { al, album } = state.playing;
    const alb = al || album;
    const { ar, artists } = state.playing;
    const art = ar || artists;
    return {
        ...state.playing,
        picUrl: alb.picUrl,
        artist: art.map(a => a.name).join('/'),
        album: alb
    };
};

export const playlist = state => {
    return state.playlist;
};

export const playLoopMode = state => {
    return state.playlist.loopMode;
};

export const nextTrackToPlay = state => {
    const { currentIndex, list } = state.playlist;
    return list[currentIndex + 1];
};
