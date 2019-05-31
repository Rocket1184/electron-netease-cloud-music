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

declare module 'electron' {
    import { IpcMessageEvent } from 'electron';
    interface IpcRenderer {
        on(channel: string, listener: (event: IpcMessageEvent, ...args: any[]) => void): this;
    }
}
