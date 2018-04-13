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
            duration: -1,
            commentThreadId: -1
        };
    },
    get PlayList() {
        return {
            id: -1,
            name: '',
            creator: new User(),
            description: '',
            commentThreadId: -1,
            playCount: -1,
            trackCount: 0,
            coverImgId: -1,
            coverImgUrl: '',
            createTime: -1,
            subscribedCount: -1,
            commentCount: -1,
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
        this.duration = o.dt || o.duration;
        this.commentThreadId = o.commentThreadId;
    }

    get picUrl() {
        return this.album.picUrl;
    }

    get artistName() {
        return this.artists.map(a => a.name).join(' / ');
    }
}

export class PlayList {
    constructor(o) {
        if (!o) return Models.PlayList;
        this.id = o.id;
        this.name = o.name;
        this.creator = new User(o.creator);
        this.description = o.description || '';
        this.commentThreadId = o.commentThreadId;
        this.playCount = o.playCount;
        this.trackCount = o.trackCount;
        this.coverImgId = o.coverImgId;
        this.coverImgUrl = o.coverImgUrl;
        this.createTime = o.createTime;
        this.subscribedCount = o.subscribedCount;
        this.commentCount = o.commentCount;
        const tracks = o.tracks || o.recommend || [];
        this.tracks = tracks.map(t => new Track(t));
    }
}
