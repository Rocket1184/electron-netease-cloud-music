export class User {
    constructor(o) {
        this.account = o.account || {};
        this.bindings = o.bindings || [];
        this.profile = o.profile || o || {};
        this.id = o.id || o.userId || this.account.id;
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
    constructor(o, source) {
        this.id = o.id;
        this.name = o.name;
        this.album = o.al || o.album;
        this.picUrl = this.album.picUrl;
        this.cd = o.cd;
        this.no = o.no;
        this.artists = o.ar || o.artists;
        this.artistName = this.artists.map(a => a.name).join(' / ');
        // #38 track.dt may be `0`
        this.duration = o.dt || o.duration || 0;
        this.commentThreadId = o.commentThreadId;
        this.source = o.source || source;
        this.mv = o.mv;
    }
}

export class PlayList {
    constructor(o) {
        this.id = o.id;
        this.name = o.name;
        this.creator = new User(o.creator);
        this.description = o.description || '';
        this.tags = o.tags || [];
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
        this.trackIds = o.trackIds || [];
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

class VideoArtist {
    constructor(o) {
        this.id = o.id || o.userId;
        this.name = o.name || o.userName || o.nickname;
    }
}

export class Video {
    static formatCreator(creators) {
        if (Array.isArray(creators)) {
            return creators.map(c => new VideoArtist(c));
        }
        return [new VideoArtist(creators)];
    }

    constructor(o) {
        this.id = o.id || o.vid;
        this.name = o.name || o.title;
        this.alias = o.alias || [o.aliaName];
        /** type `0` MV, `1` UGC */
        this.type = o.type;
        this.picUrl = o.cover || o.imgurl || o.coverUrl;
        this.creator = Video.formatCreator(o.creator || o.artist || o.artists);
        this.brs = o.brs;
        this.duration = o.duration || o.durationms;
        this.desc = o.desc;
        this.playCount = o.playCount || o.playTime;
        this.likeCount = o.likeCount || o.praisedCount;
        this.publishTime = new Date(o.publishTime);
        this.subed = o.subed;
        this.subCount = o.subCount || o.subscribeCount;
        this.commentCount = o.commentCount;
        this.commentThreadId = o.commentThreadId || o.threadId;
        this.alg = o.alg;
    }
}

export class DjRadio {
    constructor(o) {
        this.id = o.id;
        this.name = o.name;
        this.dj = o.dj;
        this.picId = o.picId;
        this.picUrl = o.picUrl;
        this.desc = o.desc;
        this.subCount = o.subCount;
        // this.shareCount = o.shareCount;
        this.likedCount = o.likedCount;
        this.programCount = o.programCount;
        this.commentCount = o.commentCount;
        this.createTime = o.createTime;
        this.categoryId = o.categoryId;
        this.category = o.category;
        // this.radioFeeType = o.radioFeeType;
        // this.feeScope = o.feeScope;
        // this.lastProgramCreateTime = o.lastProgramCreateTime;
        // this.lastProgramId = o.lastProgramId;
        // this.rcmdText = o.rcmdText;
        this.subed = o.subed;
        // this.feeInfo = o.feeInfo;
    }
}

export class DjRadioProgram {
    constructor(o, radio) {
        const album = o.mainSong.album;
        if (album.picId === 0) album.picUrl = o.coverUrl;
        if (!album.name) album.name = `[DJ节目]${o.dj.name}的DJ节目 第${o.serialNum}期`;
        this.mainSong = new Track(o.mainSong);
        this.id = o.id;
        this.createTime = o.createTime;
        this.description = o.description;
        this.listenerCount = o.listenerCount;
        this.radio = radio || o.radio;
    }
}
