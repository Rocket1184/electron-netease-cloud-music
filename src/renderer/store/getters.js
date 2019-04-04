/**
 * @typedef {import('./modules/index').State} State
 * @typedef {import('./util').EachReturnType<typeof import('./getters')>} Getters
 */

/**
 * @param {State} state
 */
export function queue(state) {
    if (state.ui.radioMode === true) {
        return state.radio;
    }
    return state.playlist;
}

/**
 * @param {State} _
 * @param {Getters} getters
 * @returns {Models.Track | Partial<Models.Track>}
 */
export function playing(_, getters) {
    const { index, list } = getters.queue;
    if (list.length === 0) return {
        name: '(暂无歌曲)'
    };
    return list[index];
}
