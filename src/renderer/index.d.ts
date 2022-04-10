type IpcRendererEventListener = (event: Electron.IpcRendererEvent, ...args: any[]) => void;

export interface EncmContextBridgeAPI {
    nodejsProcess: Pick<NodeJS.Process, ['platform', 'versions']>;
    initialSettings: any;
    on: (tag: string, callback: IpcRendererEventListener) => void;
    send: (tag: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
    interface Window {
        encm: EncmContextBridgeAPI;
    }
}

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module 'muse-ui' {
    import MuseUI from '@rocka/muse-ui';
    export default MuseUI;
}

declare module 'muse-ui-toast' {
    import { Toast as IToast } from 'muse-ui-toast/types/index';
    declare const Toast: IToast;
    export default Toast;
}

declare module 'muse-ui-message' {
    import { Message as IMessage } from 'muse-ui-message/types/index';
    declare const Message: IMessage;
    export default Message;
}
