import API, * as ApiNameSpace from '../../main/api/api';

declare class ApiRenderer extends API {
    getCookie(key?: String): Promise<String>
    updateCookie(cookie?: String | Array<String>): Promise<String>
    getDirSize(dirPath: String): Promise<Number>;
    getDataSize(type: 'all' | 'music' | 'lyric'): Promise<Number>;
    clearCache(type: 'all' | 'music' | 'lyric'): Promise<any>;
    getVersionName(): Promise<String>;
    getCurrentSettings(): Promise<ApiNameSpace.ApplicationSettings>;
    writeSettings(target: ApiNameSpace.ApplicationSettings): Promise<ApiNameSpace.ApplicationSettings>;
    resetSettings(): Promise<ApiNameSpace.ApplicationSettings>;
}

declare const ApiRendererStaic: ApiRenderer;

export default ApiRendererStaic;
