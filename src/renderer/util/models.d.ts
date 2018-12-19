declare namespace Models {

    export class User {
        id: number;
        nickname: string;
        avatarUrl: string;
        bkgUrl: string;
        gender: number;
        description: string;
        detailDescription: string;
        signature: string;
        province: number;
        city: number;
        // blew are raw data from netease login api
        account: any;
        profile: any;
        bindings: any[];
    }

    declare class RawArtist {
        id: number;
        name: string;
        img1v1Id: number;
        img1v1Id_str: string;
        img1v1IdUrl: string;
        picId: number;
        picUrl: string;
    }

    declare class RawLyrics {
        qfy: Boolean;
        sfy: Boolean;
        sgc: Boolean;
        lrc?: { version: number, lyric: string }
        tlyric?: { ersion: number, lyric: string }
        klyric?: { version: number, lyric: string }
    }

    declare class TrackUrls {
        h?: string;
        m?: string;
        l?: string;
    }

    export class Track {
        id: number;
        name: string;
        album: {
            id: number;
            name: string;
            pic: number;
            picUrl: string
        };
        artists: RawArtist[];
        lyrics: RawLyricsModel;
        urls: TrackUrls;
        commentThreadId: number;
        // getters
        picUrl: string;
        artistName: string;
    }

    export class PlayList {
        id: number;
        name: string;
        creator: User;
        description: string;
        commentThreadId: number;
        playCount: number;
        coverImgId: number;
        coverImgUrl: string;
        createTime: string;
        subscribed: boolean;
        subscribedCount: number;
        commentCount: number;
        tracks: Track[];
    }
}

export as namespace Models;
export = Models;
