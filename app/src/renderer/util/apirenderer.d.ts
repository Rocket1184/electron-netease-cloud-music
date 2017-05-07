import API, * as ApiNameSpace from '../../main/api/api';

class ApiRenderer extends API {
    getCookie(key?: String): Promise<String>
    updateCookie(cookie?: String | Array<String>): Promise<String>
    getDirSize(dirPath: String): Promise<Number>;
    getDataSize(name: 'app' | 'cache'): Promise<Number>;
    clearAppData(name: 'app' | 'cache'): Promise<void>;
    getVersionName(): Promise<String>;
    getCurrentSettings(): Promise<ApiNameSpace.ApplicationSettings>;
    writeSettings(target: ApiNameSpace.ApplicationSettings): Promise<void>;
}

const ApiRendererStaic: ApiRenderer;

export default ApiRendererStaic;
