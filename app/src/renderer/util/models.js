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
            profile: {},
            bindings: []
        };
    },
    get Track() {
        return {
            id: -1,
            name: '',
            album: {},
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
        this.id = o.id;
        this.nickname = o.nickname;
        this.avatarUrl = o.avatarUrl;
        this.bkgUrl = o.bkgUrl;
        this.gender = o.gender;
        this.description = o.description;
        this.detailDescription = o.detailDescription;
        this.signature = o.signature;
        this.province = o.province;
        this.city = o.city;
        this.profile = o.profile;
        this.bindings = o.bindings;
    }

    get avatarUrl() {
        return this.avatarUrl || this.profile.avatarUrl;
    }

    get bkgUrl() {
        return this.bkgUrl || this.profile.backgroundUrl;
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
        this.urls = {
            h: '',
            m: '',
            l: ''
        };
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
        const tracks = o.tracks || o.recommend;
        this.tracks = tracks.map(t => new Track(t));
    }
}
