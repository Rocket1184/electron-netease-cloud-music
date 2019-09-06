export const IsDev = process.env.NODE_ENV === 'development';

export const IsDarwin = process.platform === 'darwin';

/** defined in `index.dev.js` or `webpack.config.renderer.js` */
export const MainURL = process.env.MAIN_URL;

export const LoginURL = 'https://music.163.com';
