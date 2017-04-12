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
        artist: state.playing.artists.map(i => i.name).join(' / ')
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
