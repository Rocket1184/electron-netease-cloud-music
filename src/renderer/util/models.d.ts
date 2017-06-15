declare class UserModel extends Object {
    id: Number;
    nickname: String;
    avatarUrl: String;
    bkgUrl: String;
    gender: Number;
    description: String;
    detailDescription: String;
    signature: String;
    province: Number;
    city: Number;
    // blew are raw data from netease login api
    account: any;
    profile: any;
    bindings: Array<any>;
}

declare class RawArtistModel extends Object {
    id: Number;
    name: String;
    img1v1Id: Number;
    img1v1Id_str: String;
    img1v1IdUrl: String;
    picId: Number;
    picUrl: String;
}

declare class RawLyricsModel extends Object {
    qfy: Boolean;
    sfy: Boolean;
    sgc: Boolean;
    lrc?: { version: Number, lyric: String }
    tlyric?: { ersion: Number, lyric: String }
    klyric?: { version: Number, lyric: String }
}

declare class TrackUrlsModel extends Object {
    h?: String;
    m?: String;
    l?: String;
}

declare class TrackModel extends Object {
    id: Number;
    name: String;
    album: {
        id: Number;
        name: String;
        pic: Number;
        picUrl: String
    };
    artists: Array<RawArtistModel>;
    lyrics: RawLyricsModel;
    urls: TrackUrlsModel;
    commentThreadId: Number;
}

declare class PlayListModel extends Object {
    id: Number;
    name: String;
    creator: UserModel;
    commentThreadId: Number;
    playCount: Number;
    coverImgId: Number;
    coverImgUrl: String;
    tracks: Array<TrackModel>;
}

export class User extends UserModel {
    constructor(o: any);
}

export class Track extends TrackModel {
    constructor(o: any);
    picUrl: String;
    artistName: Number;
    setUrl(type: String, url: String): void;
}

export class PlayList extends PlayListModel {
    constructor(o: any);
    tracks: Array<Track>
}
