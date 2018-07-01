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
    return {
        id: 0,
        name: '未登录'
    };
};

export const playing = state => {
    const { index, list } = state.playlist;
    return {
        track: list[index]
    };
};
