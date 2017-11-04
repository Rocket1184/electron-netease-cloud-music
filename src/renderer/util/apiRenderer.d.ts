import * as ApiNameSpace from '../../main/api';

declare class ApiRenderer extends ApiNameSpace.ApiFunctions {
    getCookie(key?: string): Promise<string>
    updateCookie(cookie?: string | Array<string>): Promise<string>
    getDirSize(dirPath: string): Promise<number>;
    getDataSize(type: 'all' | 'music' | 'lyric'): Promise<number>;
    clearCache(type: 'all' | 'music' | 'lyric'): Promise<any>;
    getVersionName(): Promise<string>;
    getCurrentSettings(): Promise<ApiNameSpace.ApplicationSettings>;
    writeSettings(target: ApiNameSpace.ApplicationSettings): Promise<ApiNameSpace.ApplicationSettings>;
    resetSettings(): Promise<ApiNameSpace.ApplicationSettings>;
}

declare const ApiRendererStaic: ApiRenderer;

export default ApiRendererStaic;
