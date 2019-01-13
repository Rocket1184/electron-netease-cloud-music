export class User {
    constructor(o) {
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
        this.id = o.id;
        this.name = o.name;
        this.album = o.al || o.album;
        this.cd = o.cd;
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
        this.subscribed = o.subscribed;
        this.subscribedCount = o.subscribedCount;
        this.commentCount = o.commentCount;
        const tracks = o.tracks || o.recommend || [];
        this.tracks = tracks.map(t => new Track(t));
    }
}

export class Artist {
    constructor(o) {
        this.id = o.id;
        this.name = o.name;
        this.trans = o.trans;
        this.transNames = o.transNames;
        this.alias = o.alia || o.alias;
        this.picUrl = o.picUrl || o.img1v1Url;
        this.picId = o.picId || o.img1v1;
        this.albumSize = o.albumSize;
        this.mvSize = o.mvSize;
        this.info = o.info;
    }
}

export class Album {
    constructor(o) {
        this.id = o.id;
        this.name = o.name;
        this.alias = o.alias;
        this.transNames = o.transNames;
        this.artist = o.artist || o.artists[0];
        this.artists = o.artists;
        this.copyrightId = o.copyrightId;
        this.picId = o.picId;
        this.picUrl = o.picUrl;
        this.publishTime = o.publishTime;
        this.size = o.size;
        this.status = o.status;
        this.info = o.info;
        this.description = o.description;
        this.subType = o.subType;
        this.songs = (o.songs || []).map(t => new Track(t));
    }
}

export class Video {
    constructor(o) {
        this.id = o.id || o.vid;
        this.name = o.name || o.title;
        this.alias = o.alias || [o.aliaName];
        /** type `0` MV, `1` UGC */
        this.type = o.type;
        this.picUrl = o.cover || o.imgurl || o.coverUrl;
        this.creator = o.creator;
        if (o.type === 0 && o.creator) {
            this.artists = o.creator;
        } else if (o.artists) {
            this.artists = o.artists;
        }
        this.duration = o.duration || o.durationms;
        this.playCount = o.playCount || o.playTime;
        this.alg = o.alg;
    }
}
