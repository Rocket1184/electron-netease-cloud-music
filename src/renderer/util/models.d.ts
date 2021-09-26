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
        identify?: {
            actionUrl?: string;
            imageDesc: string;
            imageUrl: string;
        }
        // blew are raw data from netease login api
        account: any;
        profile: any;
        bindings: any[];
    }

    export class Track {
        constructor(o: any, a?: any);
        id: number;
        name: string;
        album: {
            id: number;
            name: string;
            pic: number | string;
        }
        artists: {
            id: number;
            name: string;
        }[];
        artistName: string;
        duration: number;
        cd: string;
        no: number;
        fee: any;
        copyright: any;
        privilege: EApi.Privilege;
        source?: any;
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
        /** artist's NCM account */
        accountId: number;
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

    export class DjRadio {
        constructor(o: any);
        id: number;
        name: string;
        dj: Profile;
        picId: number;
        picUrl: string;
        desc: string;
        subCount: number;
        // shareCount: number;
        likedCount: number;
        programCount: number;
        commentCount: number;
        createTime: number;
        categoryId: number;
        category: string;
        // radioFeeType: number;
        // feeScope: number;
        // lastProgramCreateTime: number;
        // lastProgramId: number;
        // rcmdText: null;
        subed: boolean;
        // feeInfo: null;
    }

    export class DjRadioProgram {
        constructor(o: any, radio: DjRadio);
        mainSong: Track;
        id: number;
        createTime: Number;
        description: string;
        radio: DjRadio;
    }
}

export as namespace Models;
export = Models;
