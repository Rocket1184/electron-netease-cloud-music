/**
 * @typedef {import('./playlist').State} PlaylistState
 * @typedef {import('./settings').State} SettingsState
 * @typedef {import('./recommend').State} RecommendState
 * @typedef {import('./radio').State} RadioState
 * @typedef {import('./user').State} UserState
 * @typedef {import('./ui').State} UiState
 * @typedef {{ playlist: PlaylistState, settings: SettingsState, recommend: RecommendState, radio: RadioState, user: UserState, ui: UiState }} State
 */

export { default as playlist } from './playlist';
export { default as settings } from './settings';
export { default as recommend } from './recommend';
export { default as radio } from './radio';
export { default as user } from './user';
export { default as ui } from './ui';
