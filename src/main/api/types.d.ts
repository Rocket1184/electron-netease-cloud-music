namespace Types {
    export type MusicQuality = 'h' | 'm' | 'l';

    interface ApiRes {
        code: number;
    }

    export interface Account {
        id: number;
        userName: string;
        type: number;
        status: number;
        whitelistAuthority: number;
        createTime: number;
        salt: string;
        tokenVersion: number;
        ban: number;
        baoyueVersion: number;
        donateVersion: number;
        vipType: number;
        viptypeVersion: number;
        anonimousUser: boolean;
    }

    export interface Profile {
        detailDescription: string;
        followed: boolean;
        vipType: number;
        accountStatus: number;
        gender: number;
        avatarImgId: number;
        birthday: number;
        nickname: string;
        city: number;
        backgroundUrl: string;
        userId: number;
        avatarImgIdStr: string;
        backgroundImgIdStr: string;
        province: number;
        defaultAvatar: boolean;
        avatarUrl: string;
        djStatus: number;
        backgroundImgId: number;
        userType: number;
        mutual: boolean;
        remarkName?: any;
        expertTags?: any;
        authStatus: number;
        experts: string[];
        description: string;
        signature: string;
        authority: number;
        followeds: number;
        follows: number;
        eventCount: number;
        playlistCount: number;
        playlistBeSubscribedCount: number;
    }

    export interface Binding {
        refreshTime: number;
        tokenJsonStr: string;
        url: string;
        userId: number;
        expired: boolean;
        expiresIn: number;
        id: number;
        type: number;
    }

    export interface LoginRes extends ApiRes {
        loginType: number;
        account: Account;
        profile: Profile;
        bindings: Binding[];
    }

    interface PlaylistCreator {
        defaultAvatar: boolean;
        province: number;
        authStatus: number;
        followed: boolean;
        avatarUrl: string;
        accountStatus: number;
        gender: number;
        city: number;
        birthday: number;
        userId: number;
        userType: number;
        nickname: string;
        signature: string;
        description: string;
        detailDescription: string;
        avatarImgId: number;
        backgroundImgId: number;
        backgroundUrl: string;
        authority: number;
        mutual: boolean;
        expertTags: string[];
        experts: string[];
        djStatus: number;
        vipType: number;
        remarkName?: string;
        backgroundImgIdStr: string;
        avatarImgIdStr: string;
        avatarImgId_str?: string;
    }

    interface UserPlaylist {
        /** empty array */
        subscribers: any[];
        subscribed: boolean;
        creator: Creator;
        artists: null;
        tracks: null;
        ordered: boolean;
        createTime: number;
        highQuality: boolean;
        trackNumberUpdateTime: number;
        adType: number;
        subscribedCount: number;
        cloudTrackCount: number;
        userId: number;
        updateTime: number;
        privacy: number;
        newImported: boolean;
        coverImgId: number;
        specialType: number;
        anonimous: boolean;
        trackUpdateTime: number;
        trackCount: number;
        totalDuration: number;
        commentThreadId: string;
        coverImgUrl: string;
        playCount: number;
        status: number;
        tags: string[];
        description: string;
        name: string;
        id: number;
        coverImgId_str: string;
    }

    export interface UserPlaylistRes extends ApiRes {
        more: boolean;
        playlist: UserPlaylist[];
    }

    export interface MusicRecordArtist {
        id: number;
        name: string;
        transName?: any;
        alias?: any;
        aliaName?: any;
        realName?: any;
        areaId: number;
        initial: number;
        type: number;
        picId: number;
        picture: null;
        hotAlbumIds?: any;
        musicSize: number;
        albumSize: number;
        score: number;
        click: number;
        hotSongs: any[];
        hotAlbums: any[];
        albums: any[];
        briefDesc: string;
        desc: string;
        json?: any;
        valid: number;
        copyright: number;
    }

    export interface MusicRecordAlbum {
        authId: number;
        status: number;
        id: number;
        language: string;
        picId: any;
        picture?: any;
        type: string;
        subType: string;
        publishTime: any;
        company: string;
        name: string;
        transName: string;
        aliaName: string;
        size: number;
        artist: MusicRecordArtist;
        genre: string;
        songs: any[];
        artists: MusicRecordArtist[];
        score: number;
        areaId: number;
        valid: number;
        copyright: number;
        briefDesc: string;
        description: string;
        json?: any;
        songSize: number;
    }

    export interface MusicRecordMusic {
        id: any;
        dfsId: any;
        size: number;
        bitrate: number;
        playTime: number;
        name: string;
        vd: number;
        sr: number;
        srcFrom?: any;
        tags?: any;
        extname: string;
    }

    export interface MusicRecordInner {
        authId: number;
        status: number;
        id: number;
        name: string;
        transName: string;
        aliaName: string;
        position: number;
        artist: MusicRecordArtist;
        artists: MusicRecordArtist[];
        album: MusicRecordAlbum;
        hMusic: MusicRecordMusic;
        mMusic: MusicRecordMusic;
        lMusic: MusicRecordMusic;
        audition?: any;
        picId: number;
        sign?: any;
        genre: string;
        json?: any;
        score: number;
        click: number;
        djId: number;
        djProgramId: number;
        mvId: number;
        valid: number;
        copyright: number;
        pubTime: any;
        musicId: any;
        songAddition?: any;
        copyFrom: string;
        ringtone: string;
        disc: string;
        no: number;
        version: number;
        clientLeak: any;
        fromType: number;
        type: string;
        subType?: any;
        dxResourceId: number;
        songUrlType: number;
        ydMiguId: string;
        flacId: number;
        fee: number;
        user_id: number;
        song_id: number;
        create_time: number;
        song_type: number;
        music_status: number;
        playTime: number;
    }

    interface MusicRecordQual {
        br: number;
        fid: any;
        size: number;
        vd: number;
    }

    export interface MusicRecordItem {
        song: MusicRecordInner;
        rtUrls: any[];
        ar: {
            id: number;
            name: string;
        }[];
        al: {
            id: number;
            name: string;
            picUrl: string;
            pic_str: string;
            pic: any;
            alia: string[];
            tns: string[];
        };
        st: number;
        a?: any;
        m: MusicRecordQual;
        mv: number;
        no: number;
        cd: string;
        rtype: number;
        rurl?: any;
        pst: number;
        alia: string[];
        pop: number;
        rt: string;
        mst: number;
        cp: number;
        crbt: string;
        cf: string;
        dt: number;
        h: MusicRecordQual;
        l: MusicRecordQual;
        rtUrl?: any;
        ftype: number;
        djId: number;
        t: number;
        name: string;
        id: number;
        eq: string;
        tns: string[];
        pc: {
            nickname: string;
            ar: string;
            sn: string;
            uid: number;
            br: number;
            cid: string;
            fn: string;
            alb: string;
        };
    }

    export interface MusicRecordData {
        playCount: number;
        score: number;
        song: MusicRecordItem;
    }

    export interface MusicRecordRes extends ApiRes {
        allData: MusicRecordData[];
        weekData: MusicRecordData[];
    }

    export interface RecommendSongArtist {
        name: string;
        id: number;
        picId: number;
        img1v1Id: number;
        briefDesc: string;
        picUrl: string;
        img1v1Url: string;
        albumSize: number;
        alias: any[];
        trans: string;
        musicSize: number;
    }

    export interface RecommendSongAlbum {
        name: string;
        id: number;
        type: string;
        size: number;
        picId: number;
        blurPicUrl: string;
        companyId: number;
        pic: number;
        picUrl: string;
        publishTime: number;
        description: string;
        tags: string;
        company: string;
        briefDesc: string;
        artist: RecommendSongArtist;
        /** empty array */
        songs: any[];
        alias: string[];
        status: number;
        copyrightId: number;
        commentThreadId: string;
        artists: RecommendSongArtist[];
        subType: string;
        transName?: any;
        picId_str: string;
    }

    export interface RecommendSongMusic {
        name: string;
        id: number;
        size: number;
        extension: string;
        sr: number;
        dfsId: number;
        bitrate: number;
        playTime: number;
        volumeDelta: number;
        dfsId_str?: string;
    }

    export interface RecommendSong {
        name: string;
        id: number;
        position: number;
        alias: string[];
        status: number;
        fee: number;
        copyrightId: number;
        disc: string;
        no: number;
        artists: RecommendSongArtist[];
        album: RecommendSongAlbum;
        starred: boolean;
        popularity: number;
        score: number;
        starredNum: number;
        duration: number;
        playedNum: number;
        dayPlays: number;
        hearTime: number;
        ringtone: string;
        crbt?: any;
        audition?: any;
        copyFrom: string;
        commentThreadId: string;
        rtUrl?: any;
        ftype: number;
        rtUrls: any[];
        copyright: number;
        transName: string;
        sign?: any;
        hMusic: RecommendSongMusic;
        mMusic: RecommendSongMusic;
        lMusic: RecommendSongMusic;
        bMusic: RecommendSongMusic;
        mvid: number;
        rurl?: any;
        rtype: number;
        mp3Url?: any;
        transNames: string[];
        privilege: Privilege;
        reason: string;
        alg: string;
    }

    export interface RecommendSongsRes extends ApiRes {
        data: {
            dailySongs: Recommend[];
            /** empty at present */
            orderSongs: any[];
        }
        recommend: RecommendSong[];
    }

    interface Privilege {
        id: number;
        fee: number;
        payed: number;
        st: number;
        pl: number;
        dl: number;
        sp: number;
        cp: number;
        subp: number;
        cs: boolean;
        maxbr: number;
        fl: number;
        toast: boolean;
        flag: number;
        preSell: boolean;
    }

    export interface TrackDetail {
        name: string;
        id: number;
        pst: number;
        t: number;
        ar: {
            id: number;
            name: string;
            tns: any[];
            alias: string[];
        }[];
        alia: string[];
        pop: number;
        st: number;
        rt: string;
        fee: number;
        v: number;
        crbt: string;
        cf: string;
        al: {
            id: number;
            name: string;
            picUrl: string;
            tns: string[];
            pic: any;
            pic_str: string;
        };
        dt: number;
        h: TrackQual;
        m: TrackQual;
        l: TrackQual;
        a?: any;
        cd: string;
        no: number;
        rtUrl?: any;
        ftype: number;
        rtUrls: any[];
        djId: number;
        copyright: number;
        s_id: number;
        mst: number;
        cp: number;
        mv: number;
        rtype: number;
        rurl?: any;
        publishTime: any;
        tns: string[];
        /** 音乐云盘内文件 */
        pc?: {
            nickname: string;
            uid: number;
            fn: string;
            cid: string;
            alb: string;
            br: number;
            ar: string;
            sn: string;
            version: number;
        };
    }

    export interface PlaylistDetail {
        subscribers: any[];
        subscribed: boolean;
        creator: Creator;
        tracks: TrackDetail[];
        trackIds: {
            id: number;
            v: number;
        }[];
        status: number;
        tags: any[];
        description?: any;
        privacy: number;
        newImported: boolean;
        ordered: boolean;
        coverImgId: number;
        playCount: number;
        coverImgUrl: string;
        trackCount: number;
        userId: number;
        specialType: number;
        updateTime: number;
        commentThreadId: string;
        highQuality: boolean;
        createTime: number;
        trackUpdateTime: number;
        adType: number;
        trackNumberUpdateTime: number;
        subscribedCount: number;
        cloudTrackCount: number;
        name: string;
        id: number;
        shareCount: number;
        commentCount: number;
    }

    export interface ListDetailRes extends ApiRes {
        playlist: PlaylistDetail;
        privileges: Privilege[];
    }

    export interface MusicUrlRes extends ApiRes {
        data: {
            br: number;
            canExtend: Boolean;
            code: number;
            expi: number;
            fee: number;
            flag: number;
            gain: number;
            id: number;
            md5: string;
            payed: number;
            size: number;
            type: string;
            uf: any;
            url: string;
        }[];
    }

    export interface MusicUrlCachedRes {
        url?: string;
        errno?: number;
    }

    export interface UserInfoInComment {
        authStatus: number;
        avatarUrl: string;
        expertTags: string[]
        locationInfo: any;
        nickname: string;
        remarkName: string;
        userId: number;
        userType: number;
        vipType: number;
    }

    export interface BeRepliedComment {
        content: string;
        status: number;
        user: UserInfoInComment;
    }

    export interface MusicCommentItem {
        beReplied: BeRepliedComment[];
        commentId: number;
        content: string;
        liked: Boolean;
        likedCount: number;
        time: number;
        user: UserInfoInComment;
    }

    export interface MusicCommentsRes extends ApiRes {
        comments: MusicCommentItem[];
        hotComments: MusicCommentItem[];
        isMusician: Boolean;
        more: Boolean;
        moreHot: Boolean;
        topComments: MusicCommentItem[];
        total: number;
        userId: number;
    }

    export interface LyricObjectItem {
        // not so clear about that
        info?: {
            al?: string;
            ar?: string;
        }
        lyrics?: {
            content: string;
            timestamp: number;
            trans?: string;
        }[]
    }

    export interface LyricAuthor {
        demand: number;
        id: number;
        nickname: string;
        status: number;
        uptime: number;
        userid: number;
    }

    export interface MusicLyricRes {
        lrc?: LyricObjectItem;
        lyricUser?: LyricAuthor;
        mlrc?: LyricObjectItem;
        transUser: LyricAuthor;
    }

    export interface DailyTaskRes extends ApiRes {
        point?: number;
        msg?: string;
    }

    export interface SearchSuggestArtist {
        id: number;
        name: string;
        picUrl: string;
        alias?: string[];
        albumSize: number;
        picId: number;
        img1v1Url: string;
        accountId: number;
        img1v1: number;
        trans?: string;
    }

    export interface SearchSuggestAlbum {
        id: number;
        name: string;
        artist: SearchSuggestArtist;
        publishTime: number;
        size: number;
        copyrightId: number;
        status: number;
        picId: number;
    }

    export interface SearchSuggestSong {
        id: number;
        name: string;
        artists: SearchSuggestArtist[];
        album: SearchSuggestAlbum;
        duration: number;
        copyrightId: number;
        status: number;
        alias: any[];
        rtype: number;
        ftype: number;
        mvid: number;
        fee: number;
        rUrl?: any;
    }

    export interface SearchSuggestMvArtist {
        id: number;
        name: string;
        alias: string[];
        transNames: string[];
    }

    export interface SearchSuggestMv {
        id: number;
        cover: string;
        name: string;
        playCount: number;
        briefDesc: string;
        desc?: string;
        artistName: string;
        artistId: number;
        duration: number;
        mark: number;
        subed: boolean;
        artists: SearchSuggestMvArtist[];
    }

    export interface SearchSuggestPlaylist {
        id: number;
        name: string;
        coverImgUrl: string;
        creator?: any;
        subscribed: boolean;
        trackCount: number;
        userId: number;
        playCount: number;
        bookCount: number;
        description: string;
        highQuality: boolean;
    }

    export interface SearchSuggestRes extends ApiRes {
        result: {
            albums?: SearchAlbum[];
            artists: SearchSuggestArtist[];
            songs?: SearchSuggestSong[];
            playlists: SearchSuggestPlaylist[];
            mvs?: SearchSuggestMv[];
        }
        order: ('songs' | 'artists' | 'playlists' | 'albums' | 'mvs')[]
    }

    interface SearchAlbumArtist {
        id: number;
        name: string;
        picUrl?: string;
        alias?: string[];
        albumSize: number;
        picId: number;
        img1v1Url: string;
        img1v1: number;
        alia: string[];
        trans?: string;
    }

    interface SearchAlbum {
        name: string;
        id: number;
        type: string;
        size: number;
        picId: number;
        blurPicUrl: string;
        companyId: number;
        pic: number;
        picUrl: string;
        publishTime: number;
        description: string;
        tags: string;
        company: string;
        briefDesc: string;
        artist: SearchAlbumArtist;
        songs: any[];
        alias: any[];
        status: number;
        copyrightId: number;
        commentThreadId: string;
        artists: SearchAlbumArtist[];
    }

    export interface SearchArtist {
        id: number;
        name: string;
        picUrl: string;
        alias: string[];
        albumSize: number;
        picId: number;
        img1v1Url: string;
        img1v1?: number;
        mvSize: number;
        followed: boolean;
        trans?: string;
        alia: string[];
        accountId?: number;
    }

    export interface SearchVideo {
        coverUrl: string;
        title: string;
        durationms: number;
        playTime: number;
        type: number;
        creator: {
            userId: number;
            userName: string;
        }[];
        aliaName?: any;
        transName?: any;
        vid: string;
        markTypes: number[];
        alg: string;
    }

    export interface SearchPlaylist {
        id: number;
        name: string;
        coverImgUrl: string;
        creator: {
            nickname: string;
            userId: number;
            userType: number;
            authStatus: number;
            /** 网易云音乐达人？ */
            expertTags?: string[];
            /** can be `1` `2` but not sure */
            experts?: number;
        };
        subscribed: boolean;
        trackCount: number;
        userId: number;
        playCount: number;
        bookCount: number;
        description: string;
        highQuality: boolean;
    }

    export interface TrackQual {
        br: number;
        fid: number;
        size: number;
        vd: number;
    }

    export interface SearchSong {
        name: string;
        id: number;
        pst: number;
        t: number;
        ar: {
            id: number;
            name: string;
            tns: any[];
            alias: any[];
        }[];
        alia: string[];
        pop: number;
        st: number;
        rt: string;
        fee: number;
        v: number;
        crbt?: any;
        cf: string;
        al: {
            id: number;
            name: string;
            picUrl: string;
            tns: any[];
            pic: any;
            pic_str: string;
        };
        dt: number;
        h: TrackQual;
        m: TrackQual;
        l: TrackQual;
        a?: any;
        cd: string;
        no: number;
        rtUrl?: any;
        ftype: number;
        rtUrls: any[];
        djId: number;
        copyright: number;
        s_id: number;
        rtype: number;
        rurl?: any;
        mst: number;
        cp: number;
        mv: number;
        publishTime: number;
        privilege: Privilege;
        tns: string[];
    }

    export interface SearchRes extends ApiRes {
        result: {
            albumCount?: number;
            albums?: SearchAlbum[];
            artistCount?: number;
            artists?: SearchArtist[];
            videoCount?: number;
            videos?: SearchVideo[];
            playlistCount?: number;
            playlists?: SearchPlaylist[];
            songCount?: number;
            songs?: SearchSong[];
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

    export interface SubscribedArtistRes extends ApiRes {
        count: number;
        hasMore: boolean;
        data: {
            /** usually empty */
            info: string;
            id: number;
            name: string;
            trans: string;
            alias: string[];
            albumSize: number;
            mvSize: number;
            picId: number;
            picUrl: string;
            img1v1Url: string;
        }[];
    }

    export interface FavoriteVideoRes extends ApiRes {
        count: number;
        hasMore: boolean;
        data: {
            alg?: string;
            aliaName?: string;
            coverUrl: string;
            creator: {
                userId: number;
                userName: string;
            }[];
            durationms: number;
            markTypes?: any;
            playTime: number;
            title: number;
            /** type `0` is MV */
            type: number;
            vid: string;
        }[];
    }

    export interface SubscribedAlbumRes extends ApiRes {
        count: number;
        hasMore: boolean;
        paidCount: number;
        data: {
            alias: string[];
            artists: {
                albumSize: number;
                alias: string[];
                briefDesc: string;
                followed: boolean;
                id: number;
                img1v1Id: any;
                img1v1Id_str: string;
                img1v1Url: string;
                musicSize: number;
                name: string;
                picId: number;
                picUrl: string;
                topicPerson: number;
                trans: string;
            }[];
            id: number;
            msg: any[];
            name: string;
            picId: any;
            picUrl: string;
            size: number;
            subTime: any;
            transNames: any[];
        }[];
    }

    export interface AlbumDetail {
        name: string;
        id: number;
        type: string;
        size: number;
        picId: number;
        blurPicUrl: string;
        companyId: number;
        pic: number;
        picUrl: string;
        publishTime: number;
        description: string;
        tags: string;
        company: string;
        briefDesc?: any;
        artist: Artist;
        songs: any[];
        alias: any[];
        status: number;
        copyrightId: number;
        commentThreadId: string;
        artists: {
            name: string;
            id: number;
            picId: number;
            img1v1Id: number;
            briefDesc: string;
            picUrl: string;
            img1v1Url: string;
            albumSize: number;
            alias: string[];
            trans: string;
            musicSize: number;
            topicPerson: number;
            picId_str?: string;
        }[];
        subType: string;
        transName?: any;
        locked: boolean;
    }

    export interface AlbumDetailSong {
        name: string;
        id: number;
        pst: number;
        t: number;
        ar: {
            id: number;
            name: string;
            tns: any[];
            alias: any[];
        }[];
        alia: any[];
        pop: number;
        st: number;
        rt?: any;
        fee: number;
        v: number;
        crbt?: any;
        cf: string;
        al: {
            id: number;
            name: string;
            tns: any[];
            pic: any;
        };
        dt: number;
        h: MusicRecordQual;
        m: MusicRecordQual;
        l: MusicRecordQual;
        a?: any;
        cd: string;
        no: number;
        rtUrl?: any;
        ftype: number;
        rtUrls: any[];
        djId: number;
        copyright: number;
        s_id: number;
        rtype: number;
        rurl?: any;
        mst: number;
        cp: number;
        mv: number;
        publishTime: any;
    }

    export interface AlbumDetailWRes extends ApiRes {
        album: AlbumDetail;
        songs: AlbumDetailSong[];
    }

    export interface AlbumDetailRes extends ApiRes {
        info: {
            resourceType: number;
            commentCount: number;
            likedCount: number;
            shareCount: number;
            threadId: string;
        };
        songs: AlbumDetailSong[];
        preSellSongIds: any[];
        album: AlbumDetail;
    }

    export interface AlbumDynamicDetailRes extends ApiRes {
        onSale: boolean;
        albumGameInfo?: any;
        commentCount: number;
        likedCount: number;
        shareCount: number;
        subTime: number;
        isSub: boolean;
        subCount: number;
    }

    export interface AlbumPrivilegeRes extends ApiRes {
        data: Privilege[];
    }
}

export as namespace Types;
