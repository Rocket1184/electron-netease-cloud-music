const Models = {
    get User() {
        return {
            id: -1,
            nickname: '',
            avatarUrl: '',
            bkgUrl: '',
            gender: -1,
            description: '',
            detailDescription: '',
            signature: '',
            province: -1,
            city: -1,
            // blew are raw data from netease login api
            account: {},
            profile: {},
            bindings: []
        };
    },
    get Track() {
        return {
            id: -1,
            name: '',
            album: {
                id: -1,
                name: '',
                pic: -1,
                picUrl: ''
            },
            artists: [],
            lyrics: {},
            urls: {},
            commentThreadId: -1
        };
    },
    get PlayList() {
        return {
            id: -1,
            name: '',
            creater: new User(),
            commentThreadId: -1,
            playCount: -1,
            coverImgId: -1,
            coverImgUrl: '',
            tracks: [new Track()]
        };
    }
};

export class User {
    constructor(o) {
        if (!o) return Models.User;
        this.account = o.account || {};
        this.bindings = o.bindings || [];
        this.profile = o.profile || o || {};
        this.id = o.id || o.userId || o.account.id;
        this.nickname = this.profile.nickname || o.nickname;
        this.avatarUrl = this.profile.avatarUrl || o.avatarUrl;
        this.bkgUrl = this.profile.backgroundUrl || o.backgroundUrl;
        this.gender = this.profile.gender || o.gender;
        this.description = this.profile.description || o.description;
        this.detailDescription = this.profile.detailDescription || o.detailDescription;
        this.signature = this.profile.signature || o.signature;
        this.province = this.profile.province || o.province;
        this.city = this.profile.city || o.city;
    }
}

export class Track {
    constructor(o) {
        if (!o) return Models.Track;
        this.id = o.id;
        this.name = o.name;
        this.album = o.al || o.album;
        this.artists = o.ar || o.artists;
        this.lyrics = o.lyrics;
        this.urls = Object.assign({
            h: '',
            m: '',
            l: ''
        }, o.urls || {});
        this.commentThreadId = o.commentThreadId;
    }

    get picUrl() {
        return this.album.picUrl;
    }

    get artistName() {
        return this.artists.map(a => a.name).join(' / ');
    }

    setUrl(type, url) {
        if (type in this.urls) {
            this.urls[type] = url;
        } else throw new Error(`Url type '${type}' is not in [h,m,l]`);
    }
}

export class PlayList {
    constructor(o) {
        if (!o) return Models.PlayList;
        this.id = o.id;
        this.name = o.name;
        this.creater = new User(o.creater);
        this.commentThreadId = o.commentThreadId;
        this.playCount = o.playCount;
        this.coverImgId = o.coverImgId;
        this.coverImgUrl = o.coverImgUrl;
        const tracks = o.tracks || o.recommend || [];
        this.tracks = tracks.map(t => new Track(t));
    }
}
