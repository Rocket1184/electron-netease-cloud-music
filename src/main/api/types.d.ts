namespace Types {
    export type CacheType = 'all' | 'music';
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
        // 以下只有电台主播才有？
        brand?: string;
        canReward?: boolean;
        rewardCount?: number;
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

    export interface VerifyCaptchaRes extends ApiRes {
        result: boolean;
        captchaId?: string;
    }

    export interface MyProfileRes extends ApiRes {
        account: Account;
        profile: Profile;
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
        experts: string[]; // maybe `Record<number, string>`
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

    export interface PlayRecordItem {
        playCount: number;
        score: number;
        song: TrackDetail;
    }

    export interface UserPlayRecordRes extends ApiRes {
        allData?: PlayRecordItem[];
        weekData?: PlayRecordItem[];
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

    export interface SongDetailMusic {
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
        hMusic: SongDetailMusic;
        mMusic: SongDetailMusic;
        lMusic: SongDetailMusic;
        bMusic: SongDetailMusic;
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
            dailySongs: RecommendSong[];
            /** empty at present */
            orderSongs: any[];
        }
        recommend: RecommendSong[];
    }

    export interface DislikeRecommendRes extends ApiRes {
        data: RecommendSong;
    }

    export interface RecommendPlaylistCreator {
        accountStatus: number;
        authStatus: number;
        authority: number;
        avatarImgId: any;
        avatarImgIdStr: string;
        avatarUrl: string;
        backgroundImgId: any;
        backgroundImgIdStr: string;
        backgroundUrl: string;
        birthday: any;
        city: number;
        defaultAvatar: boolean;
        description: string;
        detailDescription: string;
        djStatus: number;
        expertTags: string[];
        followed: boolean;
        gender: number;
        mutual: boolean;
        nickname: string;
        province: number;
        remarkName?: any;
        signature: string;
        userId: number;
        userType: number;
        vipType: number;
    }

    export interface RecommendPlaylist {
        alg: string;
        copywriter: string;
        createTime: any;
        creator: RecommendPlaylistCreator
        id: number;
        name: string;
        picUrl: string;
        playcount: number;
        trackCount: number;
        type: number;
        userId: number;
    }

    export interface RecommendPlaylistRes extends ApiRes {
        featureFirst: boolean;
        haveRcmdSongs: boolean;
        recommend: RecommendPlaylist[];
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

    export interface SongDetailRes extends ApiRes {
        privileges: Privilege[];
        songs: TrackDetail[];
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

    export interface MusicUrlLocalRes {
        url?: string;
    }

    export interface CommentUser {
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

    export interface CommentReplied {
        content: string;
        status: number;
        user: CommentUser;
    }

    export interface CommentItem {
        beReplied: CommentReplied[];
        commentId: number;
        content: string;
        liked: Boolean;
        likedCount: number;
        time: number;
        user: CommentUser;
    }

    export interface CommentsRes extends ApiRes {
        comments: CommentItem[];
        hotComments?: CommentItem[];
        isMusician: Boolean;
        more: Boolean;
        moreHot?: Boolean;
        /** empty array */
        topComments: CommentItem[];
        total: number;
        userId: number;
    }

    export interface HotCommentsRes extends ApiRes {
        hasMore: Boolean;
        hotComments: CommentItem[];
        /** empty array */
        topComments: CommentItem[];
        total: number;
    }

    export interface LikeCommentRes extends ApiRes {
        msg: string;
    }

    export interface AddCommentRes extends ApiRes {
        comment: {
            beRepliedUser?: CommentUser;
            commentId: number;
            commentLocationType: number;
            content: string;
            expressionUrl?: any;
            time: number;
            user: CommentUser;
        }
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
        txtLyric?: string;
    }

    export interface DailyTaskRes extends ApiRes {
        point?: number;
        msg?: string;
    }

    export interface GetDailyTaskRes extends ApiRes {
        mobileSign: boolean;
        pcSign: boolean;
        share: boolean;
        shareSina: boolean;
    }

    export interface CollectTrackRes extends ApiRes {
        cloudCount: number;
        count: number;
        rackIds: string;
    }

    export interface UncollectTrackRes extends ApiRes {
        cloudCount: number;
        count: number;
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

    export interface SearchMV {
        alias: string[];
        artistId: number;
        artistName: string;
        artists: {
            alias: string[];
            id: number;
            name: string;
            transNames: string[];
        }[];
        briefDesc: string;
        cover: string;
        desc?: any;
        duration: number;
        id: number;
        mark: number;
        name: string;
        playCount: number;
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
            mvCount?: number;
            mvs?: SearchMV[];
            userprofileCount?: number;
            userprofiles?: Profile[];
        }
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

    export interface AlbumDetailArtist {
        albumSize: number;
        alias: any[];
        briefDesc: string;
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
    }

    export interface SubscribedAlbumRes extends ApiRes {
        count: number;
        hasMore: boolean;
        paidCount: number;
        data: {
            alias: string[];
            artists: AlbumDetailArtist[];
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
        artist: AlbumDetailArtist;
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

    export interface RelatedPlaylist {
        id: string;
        name: string;
        picUrl: string;
        creator: {
            id: string;
            name: string;
        }
    }

    export interface RelatedPlaylistsRes extends ApiRes {
        data: RelatedPlaylist[];
    }

    export interface RelatedAlbum {
        id: string;
        name: string;
        picUrl: string;
        publishDate: string;
    }

    export interface RecommendStatisticsData {
        playCnt: number;
        likeCnt: number;
        followCnt: number;
    }

    export interface RecommendStatisticsRes extends ApiRes {
        data: RecommendStatisticsData;
    }

    export interface RelatedAlbumsRes extends ApiRes {
        data: RelatedAlbum[];
    }

    export interface SubscribeAlbumRes extends ApiRes {
        /** 
         * error message
         * - `200` 该专辑已在用户收藏列表中
         */
        message?: string;
        /** success timestamp */
        time?: number;
    }

    export interface UnsubscribeAlbumRes extends ApiRes {
        /** 
         * error message
         * - `404` 用户未未收藏此专辑
         */
        message?: string;
        /** success timestamp */
        time?: number;
    }

    export interface RecommendMVResult {
        alg: string;
        artistId: number;
        artistName: string;
        artists: {
            id: number;
            name: string;
        }[];
        canDislike: boolean;
        copywriter: string;
        duration: number;
        id: number;
        name: string;
        picUrl: string;
        playCount: number;
        subed: boolean;
        type: number;
    }

    export interface RecommendMVRes extends ApiRes {
        category: number;
        code: number;
        result: RecommendMVResult[];
    }

    export interface PersonalizedPlaylist {
        alg: string;
        canDislike: boolean;
        copywriter: string;
        highQuality: boolean;
        id: number;
        name: string;
        picUrl: string;
        playCount: number;
        trackCount: number;
        type: number;
    }

    export interface PersonalizedPlaylistRes extends ApiRes {
        category: number;
        code: number;
        hasTaste: boolean;
        result: PersonalizedPlaylist[];
    }

    export interface ArtistDetailEArtist {
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
        mvSize: number;
    }

    export interface ArtistDetailEHotSong {
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
    }

    export interface ArtistDetailERes extends ApiRes {
        artist: ArtistDetailEArtist;
        more: boolean;
        hotSongs: ArtistDetailEHotSong[];
    }

    export interface ArtistDetailWArtist {
        albumSize: number;
        alias: string[];
        briefDesc: string;
        followed: boolean;
        id: number;
        img1v1Id: number;
        img1v1Id_str: string;
        img1v1Url: string;
        musicSize: number;
        mvSize?: number;
        name: string;
        picId: number;
        picId_str?: string;
        picUrl: string;
        publishTime?: number;
        topicPerson: number;
        trans: string;
    }

    export interface ArtistDetailWAlbum {
        alias: string[];
        artist: ArtistDetailWArtist;
        artists: ArtistDetailWArtist[];
        blurPicUrl: string;
        briefDesc: string;
        commentThreadId: string;
        company: string;
        companyId: number;
        copyrightId: number;
        description: string;
        id: number;
        name: string;
        onSale: boolean;
        paid: boolean;
        pic: any;
        picId: any;
        picId_str: string;
        picUrl: string;
        publishTime: any;
        size: number;
        /** empty */
        songs: any[];
        status: number;
        subType: string;
        tags: string;
        type: string;
    }

    export interface ArtistDetailWArtistHotSong {
        album: ArtistDetailWAlbum;
        alias: string[];
        artists: ArtistDetailWArtist[];
        audition?: any;
        bMusic: SongDetailMusic;
        copyFrom: string;
        copyrightId: number;
        crbt?: any;
        dayPlays: number;
        disc: string;
        duration: number;
        fee: number;
        ftype: number;
        hMusic: SongDetailMusic;
        hearTime: number;
        id: number;
        lMusic: SongDetailMusic;
        mMusic: SongDetailMusic;
        mp3Url: string;
        mvid: number;
        name: string;
        no: number;
        playedNum: number;
        popularity: number;
        ringtone: string;
        rtUrl?: any;
        rtUrls?: any;
        rtype: number;
        rurl?: any;
        score: number;
        starred: boolean;
        starredNum: number;
        status: number;
    }

    export interface ArtistDetailWRes extends ApiRes {
        artist: ArtistDetailWArtist;
        hotSongs: ArtistDetailWArtistHotSong[];
        more: boolean;
    }

    export interface ArtistDynamicDetailRes extends ApiRes {
        followed: boolean;
        concert: {
            simpleConcert?: any;
            onlineCount: number;
            view: boolean;
        };
        code: number;
        videoNum: {
            cat: number;
            num: number;
        }[];
        rcmdResource?: any;
    }

    export interface ArtistAlbumsAlbum extends ArtistDetailWAlbum {
        isSub: boolean;
    }

    export interface ArtistAlbumsRes extends ApiRes {
        artist: ArtistDetailWArtist;
        hotAlbums: ArtistAlbumsAlbum[];
        more: boolean;
    }

    export interface ArtistMVsArtist {
        albumSize: number;
        alias: any[];
        briefDesc: string;
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
    }

    export interface ArtistMVsMV {
        artist: ArtistMVsArtist;
        artistName: string;
        duration: number;
        id: number;
        imgurl: string;
        imgurl16v9: string;
        name: string;
        playCount: number;
        publishTime: string;
        status: number;
        subed: boolean;
    }

    export interface ArtistMVsRes extends ApiRes {
        hasMore: boolean;
        mvs: ArtistMVsMV[];
        time: number;
    }

    export interface ArtistIntroRes extends ApiRes {
        briefDesc: string;
        count: number;
        introduction: {
            ti: string;
            txt: string;
        }[];
        topicData?: any;
    }

    export interface MVDetailData {
        artistId: number;
        artistName: string;
        artists: {
            id: number;
            name: string;
        }[];
        briefDesc: string;
        brs: {
            240: string;
            480: string;
            720: string;
            1080: string;
            [key: number]: string;
        };
        commentCount: number;
        commentThreadId: string;
        cover: string;
        coverId: number;
        desc: string;
        duration: number;
        id: number;
        isReward: boolean;
        likeCount: number;
        nType: number;
        name: string;
        playCount: number;
        publishTime: string;
        shareCount: number;
        subCount: number;
    }

    export interface MVDetailRes extends ApiRes {
        bufferPic: string;
        bufferPicFS: string;
        data: MVDetailData;
        loadingPic: string;
        loadingPicFS: string;
        subed: boolean;
    }

    export interface SubscribeMVRes extends ApiRes {
        data?: any;
        message: string;
    }

    export interface UnsubscribeMVRes extends ApiRes {
        data?: any;
        message: string;
    }

    export interface VideoDetailCreator {
        accountStatus: number;
        authStatus: number;
        avatarUrl: string;
        expertTags?: any;
        experts?: any;
        followed: boolean;
        nickname: string;
        userId: number;
        userType: number;
    }

    export interface VideoDetailData {
        advertisement: boolean;
        authType: number;
        avatarUrl: string;
        commentCount: number;
        coverUrl: string;
        creator: VideoDetailCreator;
        description?: any;
        durationms: number;
        hasRelatedGameAd: boolean;
        height: number;
        markTypes: number[];
        playTime: number;
        praisedCount: number;
        publishTime: number;
        resolutions: {
            resolution: number;
            size: number;
        }[];
        shareCount: number;
        subscribeCount: number;
        threadId: string;
        title: string;
        vid: string;
        videoGroup: {
            alg: string;
            id: number;
            name: string;
        }[];
        width: number;
    }

    export interface VideoDetailRes extends ApiRes {
        data: VideoDetailData;
        message: string;
    }

    export interface SubscribeVideoRes extends ApiRes {
        data?: any;
        message: string;
    }

    export interface UnsubscribeVideoRes extends ApiRes {
        data?: any;
        message: string;
    }

    export interface CommentThreadInfoERes extends ApiRes {
        commentCount: number;
        liked: boolean;
        likedCount: number;
        shareCount: number;
    }

    export interface VideoStatisticRes extends ApiRes {
        data: {
            playTime: number;
            praisedCount: number;
            subscribeCount: number;
            subscribed: boolean;
        };
        message: string;
    }

    export interface VideoURLRes extends ApiRes {
        urls: {
            id: string;
            needPay: boolean;
            payInfo?: any;
            r: number;
            size: number;
            url: string;
            validityTime: number;
        }[];
    }

    export interface RadioRes extends ApiRes {
        data: RadioSong[];
        popAdjust: boolean;
    }

    export interface RadioSong {
        album: RadioAlbum;
        alg: string;
        alias: string[];
        artists: RadioArtist[];
        audition: any;
        bMusic: SongDetailMusic;
        commentThreadId: string;
        copyFrom: string;
        copyright: number;
        copyrightId: number;
        crbt: any;
        dayPlays: number;
        disc: string;
        duration: number;
        fee: number;
        ftype: number;
        hMusic: SongDetailMusic;
        hearTime: number;
        id: number;
        lMusic: SongDetailMusic;
        mMusic: SongDetailMusic;
        mp3Url: any;
        mvid: number;
        name: string;
        no: number;
        playedNum: number;
        popularity: number;
        position: number;
        privilege: Privilege;
        ringtone: string;
        rtUrl: any;
        rtUrls: any[];
        rtype: number;
        rurl: any;
        score: number;
        sign: any;
        starred: boolean;
        starredNum: number;
        status: number;
        transName: any;
    }

    export interface RadioAlbum {
        alias: string[];
        artist: RadioArtist;
        artists: RadioArtist[];
        blurPicUrl: string;
        briefDesc: string;
        commentThreadId: string;
        company: string;
        companyId: number;
        copyrightId: number;
        description: string;
        id: number;
        name: string;
        pic: number;
        picId: number;
        picUrl: string;
        publishTime: number;
        size: number;
        songs: any[];
        status: number;
        subType: string;
        tags: string;
        transName: null;
        type: string;
        picId_str?: string;
    }

    export interface RadioArtist {
        albumSize: number;
        alias: string[];
        briefDesc: string;
        id: number;
        img1v1Id: number;
        img1v1Url: string;
        musicSize: number;
        name: string;
        picId: number;
        picUrl: string;
        trans: string;
    }

    export interface DislikeRadioSongRes extends ApiRes {
        count: number;
        /** not sure what's this */
        songs: any[];
    }

    export interface RadioTrashERes extends ApiRes {
        hasMore: boolean;
        /** for pagination */
        addTime: number;
        data: TrashSong[];
        count: number;
    }

    export interface TrashSong {
        name: string;
        id: number;
        position: number;
        alias: string[];
        status: number;
        fee: number;
        copyrightId: number;
        disc: string;
        no: number;
        artists: RadioArtist[];
        album: RadioAlbum;
        starred: boolean;
        popularity: number;
        score: number;
        starredNum: number;
        duration: number;
        playedNum: number;
        dayPlays: number;
        hearTime: number;
        ringtone: null | string;
        crbt: null;
        audition: null;
        copyFrom: string;
        commentThreadId: string;
        rtUrl: null;
        ftype: number;
        rtUrls: any[];
        copyright: number;
        transName: null;
        sign: null;
        hMusic: SongDetailMusic;
        mMusic: SongDetailMusic;
        lMusic: SongDetailMusic;
        bMusic: SongDetailMusic;
        mvid: number;
        rtype: number;
        mp3Url: null;
        rurl: null;
        privilege: Privilege;
    }

    export interface SkipRadioERes extends ApiRes {
        /** empty */
        songs: [];
    }

    export interface LikeRadioERes extends ApiRes {
        /** empty */
        songs: [];
        playlistId: number;
    }

    export interface AddRadioTrashERes extends ApiRes {
        /** empty */
        songs: [];
        count: number;
    }

    export interface LikeSongERes extends ApiRes {
        playlistId: number;
    }

    export interface NewAlbumsRes extends ApiRes {
        category: number;
        result: NewAlbumAlbum[];
    }

    type NewAlbumAlg = "featured" | "artistbased" | "tagbased" | "cityLevel_A";

    export interface NewAlbumAlbum {
        alg: NewAlbumAlg;
        artistName: string;
        artists: {
            id: number;
            name: string;
        }[];
        canDislike: boolean;
        copywriter: string;
        id: number;
        name: string;
        picUrl: string;
        type: number;
    }

    export interface Banner {
        adLocation: any;
        adSource: any;
        adid: any;
        /** web banner only */
        backgroundImageUrl?: string;
        encodeId: string;
        /** client banner only */
        event?: any;
        exclusive: boolean;
        extMonitor: any;
        extMonitorInfo: any;
        imageUrl: string;
        monitorBlackList: any;
        monitorClick: any;
        monitorClickList: any;
        monitorImpress: any;
        monitorImpressList: any;
        monitorType: any;
        program: any;
        scm: string;
        /** client banner only */
        song: TrackDetail;
        targetId: number;
        targetType: number;
        titleColor: string;
        typeTitle: string;
        url?: string;
        video?: any;
    }

    export interface BannerRes extends ApiRes {
        banners: Banner[]
    }

    export interface SubscribedDjRadio {
        dj: PlaylistCreator;
        category: string;
        buyed: boolean;
        price: number;
        originalPrice: number;
        discountPrice: null;
        purchaseCount: number;
        lastProgramName: string;
        videos: null;
        finished: boolean;
        underShelf: boolean;
        subCount: number;
        picId: number;
        createTime: number;
        radioFeeType: number;
        picUrl: string;
        categoryId: number;
        desc: string;
        feeScope: number;
        lastProgramCreateTime: number;
        programCount: number;
        lastProgramId: number;
        name: string;
        id: number;
        rcmdtext: null;
        newProgramCount: number;
    }

    export interface SubscribedDjRes extends ApiRes {
        count: number;
        djRadios: SubscribedDjRadio[];
        time: number;
        hasMore: boolean;
    }

    export interface DjComment {
        userProfile: Profile;
        content: string;
        programName: string;
        programId: number;
        commentId: number;
    }

    export interface DjDetailData {
        id: number;
        name: string;
        dj: Profile;
        picId: number;
        picUrl: string;
        desc: string;
        subCount: number;
        shareCount: number;
        likedCount: number;
        programCount: number;
        commentCount: number;
        createTime: number;
        categoryId: number;
        category: string;
        radioFeeType: number;
        feeScope: number;
        lastProgramCreateTime: number;
        lastProgramId: number;
        rcmdText: null;
        subed: boolean;
        commentDatas: DjComment[];
        feeInfo: null;
    }

    export interface DjDetailRes {
        code: number;
        msg: null;
        data: DjDetailData;
    }

    export interface DjProgramRadio {
        dj: null;
        category: string[];
        buyed: boolean;
        price: number;
        originalPrice: number;
        discountPrice: null;
        purchaseCount: number;
        lastProgramName: null;
        videos: null;
        finished: boolean;
        underShelf: boolean;
        picUrl: string;
        radioFeeType: number;
        lastProgramCreateTime: number;
        categoryId: number;
        createTime: number;
        lastProgramId: number;
        feeScope: number;
        programCount: number;
        subCount: number;
        picId: number;
        desc: string;
        name: Brand;
        id: number;
        subed: boolean;
    }

    export interface DjProgram {
        mainSong: RadioSong;
        songs: null;
        dj: Profile;
        blurCoverUrl: string;
        radio: DjProgramRadio;
        duration: number;
        buyed: boolean;
        programDesc: null;
        h5Links: null;
        canReward: boolean;
        auditStatus: number;
        videoInfo: null;
        score: number;
        mainTrackId: number;
        programFeeType: number;
        titbits: null;
        smallLanguageAuditStatus: number;
        commentThreadId: string;
        trackCount: number;
        titbitImages: null;
        isPublish: boolean;
        serialNum: number;
        coverUrl: string;
        listenerCount: number;
        subscribedCount: number;
        createTime: number;
        reward: boolean;
        channels: any[];
        feeScope: number;
        pubStatus: number;
        bdAuditStatus: number;
        description: string;
        name: string;
        id: number;
        subscribed: boolean;
        shareCount: number;
        likedCount: number;
        commentCount: number;
    }

    export interface DjProgramRes extends ApiRes {
        asc: boolean;
        count: number;
        programs: DjProgram[];
        more: boolean;
    }

    export interface DjProgramDetailRes extends ApiRes {
        program: Program;
    }

    export interface DjProgramMusicsRes extends ApiRes {
        programs: {
            id: number;
            musics: {
                size: number;
                bitrate: number;
            }[];
        }[];
    }

    export interface DjCreatedByRes extends ApiRes {
        djRadios: SubscribedDjRadio[];
        hasMore: boolean;
    }

    export interface UserInfoRes extends ApiRes {
        adValid: boolean;
        bindings: Binding[];
        createDays: number;
        createTime: number;
        level: number;
        listenSongs: number;
        mobileSign: boolean;
        pcSign: boolean;
        peopleCanSeeMyPlayRecord: boolean;
        profile: Profile;
        userPoint: UserPoint;
    }

    export interface UserPoint {
        balance: number;
        blockBalance: number;
        status: number;
        updateTime: number;
        userId: number;
        version: number;
    }

    export interface FollowUserRes extends ApiRes {
        followContent: string;
        followTimeContent: string;
        py: string;
        user: Profile;
    }

    export interface UserFollowsRes extends ApiRes {
        follow: Profile[];
        more: boolean;
        touchCount: number;
    }

    export interface UserFollowersRes extends ApiRes {
        followeds: Profile[];
        more: boolean;
    }

    export interface Event {
        actId: number;
        actName: null;
        eventTime: number;
        expireTime: number;
        forwardCount: number;
        id: number;
        info: EventInfo;
        insiteForwardCount: number;
        json: string;
        lotteryEventData: null;
        pendantData: null;
        pics: EventPic[];
        rcmdInfo: null;
        showTime: number;
        tmplId: number;
        topEvent: boolean;
        type: number;
        user: Profile;
        uuid: null | string;
    }

    export interface EventInfo {
        commentCount: number;
        commentThread: EventCommentThread;
        comments: null;
        latestLikedUsers: null;
        liked: boolean;
        likedCount: number;
        resourceId: number;
        resourceType: number;
        shareCount: number;
        threadId: string;
    }

    export interface EventCommentThread {
        commentCount: number;
        hotCount: number;
        id: string;
        latestLikedUsers: {
            s: number;
            t: number;
        }[];
        likedCount: number;
        resourceId: number;
        resourceInfo: {
            creator: null;
            eventType?: number;
            id: number;
            imgUrl: null;
            name: string;
            userId: number;
        };
        resourceOwnerId: number;
        resourceTitle: string;
        resourceType: number;
        shareCount: number;
    }

    export interface EventPic {
        format: string;
        height: number;
        originUrl: string;
        pcRectangleUrl: string;
        pcSquareUrl: string;
        rectangleUrl: string;
        squareUrl: string;
        width: number;
    }


    export interface UserEventsRes extends ApiRes {
        events: Event[];
        lasttime: number;
        more: boolean;
        size: number;
    }

    export interface UserTopEventsRes extends ApiRes {
        data: Event;
    }

    export interface LikedSongIdsRes extends ApiRes {
        ids: number[];
    }

    export interface PrivateCloudListItem {
        simpleSong: EApi.Song;
        addTime: number;
        songId: number;
        cover: number;
        songName: string;
        fileSize: number;
        coverId: string;
        lyricId: string;
        album: string;
        artist: string;
        version: number;
        bitrate: number;
        fileName: string;
    }

    export interface PrivateCloudListRes extends ApiRes {
        data: PrivateCloudListItem[];
        count: number;
        size: string;
        maxSize: string;
        upgradeSign: number;
        hasMore: boolean;
    }
}

export as namespace Types;
