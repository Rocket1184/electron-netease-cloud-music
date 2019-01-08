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

    export class Track {
        id: number;
        name: string;
        album: {
            id: number;
            name: string;
            pic: number;
            picUrl: string
        };
        cd: string;
        artists: Artist[];
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


    export class Artist {
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
        alg?: any;
        aliaName: string;
        coverUrl: string;
        creator: {
            userId: number;
            userName: string;
        }[];
        durationms: number;
        markTypes?: any;
        playTime: number;
        title: number;
        type: number;
        vid: string;
    }
}

export as namespace Models;
export = Models;
