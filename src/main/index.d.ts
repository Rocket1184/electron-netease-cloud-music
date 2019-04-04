import { IpcMessageEvent } from 'electron';

declare module 'electron' {
    interface IpcMain {
        on(channel: string, listener: (event: IpcMessageEvent, ...args: any[]) => void): this;
        once(channel: string, listener: (event: IpcMessageEvent, ...args: any[]) => void): this;
    }
}
