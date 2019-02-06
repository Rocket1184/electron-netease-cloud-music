export function queue(state) {
    if (state.ui.radioMode === true) {
        return state.radio;
    }
    return state.playlist;
}

export function playing(_, getters) {
    const { index, list } = getters.queue;
    if (list.length === 0) return {
        name: '(暂无歌曲)'
    };
    return list[index];
}
