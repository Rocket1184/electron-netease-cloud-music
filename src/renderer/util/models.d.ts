namespace Models {
    export class User {
        constructor(o: any);
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

    export class Track {
        constructor(o: any);
        id: number;
        name: string;
        album: {
            id: number;
            name: string;
            pic: number;
            picUrl: string
        };
        picUrl: string;
        cd: string;
        no: number;
        artists: Artist[];
        artistName: string;
        lyrics: {
            qfy: Boolean;
            sfy: Boolean;
            sgc: Boolean;
            lrc?: { version: number, lyric: string }
            tlyric?: { ersion: number, lyric: string }
            klyric?: { version: number, lyric: string }
        }[];
        urls: {
            h?: string;
            m?: string;
            l?: string;
        };
        commentThreadId: number;
        source: {
            name: string;
            id: string;
        }
        /** MV ID */
        mv: number;
    }

    export class PlayList {
        constructor(o: any);
        id: number;
        name: string;
        creator: User;
        description: string;
        tags: string[];
        commentThreadId: number;
        playCount: number;
        coverImgId: number;
        coverImgUrl: string;
        createTime: string;
        subscribed: boolean;
        subscribedCount: number;
        commentCount: number;
        tracks: Track[];
        trackIds: {
            id: number;
            v: number;
        }[]
    }

    export class Artist {
        constructor(o: any);
        id: number;
        name: string;
        trans?: string;
        transNames?: string[];
        /** only present in search result, equals `alias` */
        alia?: string[];
        alias?: string[];
        img1v1: number;
        img1v1Url: string;
        picId: number;
        picUrl?: string;
        albumSize?: number;
        mvSize?: number;
        /** usually an empty string */
        info: string;
    }

    export class Album {
        constructor(o: any);
        id: number;
        name: string;
        alias: string[];
        transNames: string[];
        artist: Artist;
        artists: Artist[];
        copyrightId: number;
        picId: number;
        picUrl: string;
        publishTime: number;
        size: number;
        status: number;
        info: {
            commentCount: number;
            threadId: string;
            liked: boolean;
            likedCount: number;
            resourceId: number;
            resourceType: number;
            shareCount: number;
        };
        description: string;
        subType: string;
        songs: Track[];
    }

    export class Video {
        constructor(o: any);
        id: string;
        name: number;
        alias: string[];
        /** type `0` MV, `1` UGC */
        type: number;
        picUrl: string;
        creator?: {
            userId: number;
            userName: string;
        }[];
        /** MV only */
        brs?: { [key: number]: string; }
        duration: number;
        desc?: string;
        playCount: number;
        likeCount: number;
        publishTime: Date;
        /** MV only */
        subed?: boolean;
        subCount: number;
        commentCount: number;
        commentThreadId: string;
        alg?: any;
    }
}

export as namespace Models;
export = Models;
