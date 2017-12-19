declare class UserModel extends Object {
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
    bindings: Array<any>;
}

declare class RawArtistModel extends Object {
    id: number;
    name: string;
    img1v1Id: number;
    img1v1Id_str: string;
    img1v1IdUrl: string;
    picId: number;
    picUrl: string;
}

declare class RawLyricsModel extends Object {
    qfy: Boolean;
    sfy: Boolean;
    sgc: Boolean;
    lrc?: { version: number, lyric: string }
    tlyric?: { ersion: number, lyric: string }
    klyric?: { version: number, lyric: string }
}

declare class TrackUrlsModel extends Object {
    h?: string;
    m?: string;
    l?: string;
}

declare class TrackModel extends Object {
    id: number;
    name: string;
    album: {
        id: number;
        name: string;
        pic: number;
        picUrl: string
    };
    artists: Array<RawArtistModel>;
    lyrics: RawLyricsModel;
    urls: TrackUrlsModel;
    commentThreadId: number;
}

declare class PlayListModel extends Object {
    id: number;
    name: string;
    creator: UserModel;
    commentThreadId: number;
    playCount: number;
    coverImgId: number;
    coverImgUrl: string;
    createTime: string;
    subscribedCount: number;
    commentCount: number;
    tracks: Array<TrackModel>;
}

export class User extends UserModel {
    constructor(o: any);
}

export class Track extends TrackModel {
    constructor(o: any);
    picUrl: string;
    artistName: number;
    setUrl(type: string, url: string): void;
}

export class PlayList extends PlayListModel {
    constructor(o: any);
    tracks: Array<Track>
}
