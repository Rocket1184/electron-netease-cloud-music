namespace Types {
    export type MusicQuality = 'h' | 'm' | 'l';

    export interface ApiRes {
        code: number;
    }

    export interface LoginRes extends ApiRes {
        loginType: number
        account: any
        profile: any
        bidings: any[]
    }

    export interface UserPlaylistRes extends ApiRes {
        more: Boolean
        playlist: Models.PlayList[]
    }

    export interface MusicRecordDataItem {
        playCount: number
        score: number
        song: {
            id: number
            name: string
            al: {
                id: number
                name: string
                pic: number
                picUrl: string
                pic_str: string
            },
            ar: {
                id: number
                name: string
            }
        }
    }

    export interface MusicRecordRes extends ApiRes {
        allData: MusicRecordDataItem[]
        weekData: MusicRecordDataItem[]
    }

    export interface RecommendSongs extends Models.Track {
        alg: string
        reason: string
    }

    export interface RecommendSongsRes extends ApiRes {
        recommend: RecommendSongs[]
    }

    export interface ListDetailRes extends ApiRes {
        playlist: Models.PlayList
        privileges: any[]
    }

    export interface MusicUrlRes extends ApiRes {
        data: {
            br: number
            canExtend: Boolean
            code: number
            expi: number
            fee: number
            flag: number
            gain: number
            id: number
            md5: string
            payed: number
            size: number
            type: string
            uf: any
            url: string
        }[]
    }

    export interface MusicUrlCachedRes {
        url?: string
        errno?: number | 200 | 404
    }

    export interface UserInfoInComment {
        authStatus: number
        avatarUrl: string
        expertTags: string[]
        locationInfo: any
        nickname: string
        remarkName: string
        userId: number
        userType: number
        vipType: number
    }

    export interface BeRepliedComment {
        content: string
        status: number
        user: UserInfoInComment
    }

    export interface MusicCommentItem {
        beReplied: BeRepliedComment[]
        commentId: number
        content: string
        liked: Boolean
        likedCount: number
        time: number
        user: UserInfoInComment
    }

    export interface MusicCommentsRes extends ApiRes {
        comments: MusicCommentItem[]
        hotComments: MusicCommentItem[]
        isMusician: Boolean
        more: Boolean
        moreHot: Boolean
        topComments: MusicCommentItem[]
        total: number
        userId: number
    }

    export interface LyricObjectItem {
        // not so clear about that
        info?: {
            al?: string
            ar?: string
        }
        lyrics?: {
            content: string
            timestamp: number
            trans?: string
        }[]
    }

    export interface LyricAuthor {
        demand: number
        id: number
        nickname: string
        status: number
        uptime: number
        userid: number
    }

    export interface MusicLyricRes {
        lrc?: LyricObjectItem
        lyricUser?: LyricAuthor
        mlrc?: LyricObjectItem
        transUser: LyricAuthor
    }

    export interface DailyTaskRes extends ApiRes {
        point?: number
        msg?: string
    }

    export interface RawAlbum {
        id: number,
        name: string,
        artist: Models.RawArtist,
        copyrightId: number,
        picId: number,
        publishTime: number,
        size: number,
        status: number
    }

    export interface RawMV {
        artistId: number,
        artistName: string,
        artists: Models.RawArtist[],
        briefDesc: string,
        cover: string,
        desc: any,
        duration: number,
        mark: number,
        name: string,
        playCount: number,
        subed: Boolean
    }

    export interface SearchRes extends ApiRes {
        result: {
            songs?: Models.Track[],
            artists?: Models.RawArtist[],
            playlists?: Models.PlayList[],
            albums?: RawAlbum[],
            mvs?: RawMV[],
            order: ('songs' | 'artists' | 'playlists' | 'albums' | 'mvs')[]
        }
    }

    export interface Settings {
        bitRate: MusicQuality;
        windowBorder: boolean;
        autoPlay: boolean;
        themePrimaryColor: string;
        themeSecondaryColor: string;
        themeVariety: string;
    }
}

export as namespace Types;
