namespace EApi {
    // general
    export interface Account {
        anonimousUser: boolean;
        ban: number;
        baoyueVersion: number;
        createTime: number;
        donateVersion: number;
        id: number;
        paidFee: boolean;
        status: number;
        tokenVersion: number;
        type: number;
        userName: string;
        vipType: number;
        whitelistAuthority: number;
    }

    export interface Profile {
        accountStatus: number;
        authStatus: number;
        authority: number;
        avatarImgId: number;
        avatarUrl: string;
        backgroundImgId: number;
        backgroundUrl: string;
        birthday: number;
        city: number;
        defaultAvatar: boolean;
        description: string;
        detailDescription: string;
        djStatus: number;
        expertTags?: any;
        experts: string[];
        followed: boolean;
        gender: number;
        mutual: boolean;
        nickname: string;
        province: number;
        remarkName?: string;
        signature: string;
        userId: number;
        userType: number;
        vipType: number;
    }

    export interface MyProfile extends Profile {
        accountType: number;
        anchor: boolean;
        authenticated: boolean;
        authenticationTypes: number;
        createTime: number;
        lastLoginIP: string;
        lastLoginTime: number;
        locationStatus: number;
        shortUserName: string;
        userName: string;
        viptypeVersion: number;
    }

    // song detail
    export interface Privilege {
        cp: number;
        cs: boolean;
        dl: number;
        fee: number;
        fl: number;
        flag: number;
        id: number;
        maxbr: number;
        payed: number;
        pl: number;
        preSell: boolean;
        sp: number;
        st: number;
        subp: number;
        toast: boolean;
    }

    export interface Variant {
        br: number;
        fid: number;
        size: number;
        vd: number;
    }

    export interface Al {
        id: number;
        name: string;
        pic: number;
        tns: any[];
        pic_str?: string;
    }

    export interface Ar {
        alias: any[];
        id: number;
        name: string;
        tns: any[];
    }

    export interface Song {
        a: any;
        al: Al;
        alia: string[];
        ar: Ar[];
        cd: string;
        cf: string;
        copyright: number;
        cp: number;
        crbt: null;
        djId: number;
        dt: number;
        fee: number;
        ftype: number;
        h?: Variant;
        id: number;
        l?: Variant;
        m: Variant;
        mark: number;
        mst: number;
        mv: number;
        name: string;
        no: number;
        originCoverType: number;
        pop: number;
        pst: number;
        publishTime: number;
        rt?: string;
        rtUrl: any;
        rtUrls: any[];
        rtype: number;
        rurl: any;
        s_id: number;
        st: number;
        t: number;
        v: number;
        tns?: string[];
        /** private cloud? */
        pc?: {
            nickname: string;
            ar: string;
            sn: string;
            alb: string;
            uid: number;
            fn: string;
            br: number;
            cid: string;
        };
    }

    // album detail
    export interface Album {
        alias: string[];
        artist: Artist;
        artists: Artist[];
        blurPicUrl: string;
        briefDesc: string;
        commentThreadId: string;
        company: string;
        companyId: number;
        copyrightId: number;
        description: string;
        id: number;
        mark?: number;
        name: string;
        pic: number;
        picId: number;
        picUrl: string;
        publishTime: number;
        size: number;
        songs: any[];
        status: number;
        subType?: string;
        tags: string;
        type: string;
        transName?: string;
        locked?: boolean;
        picId_str?: string;
    }

    export interface Artist {
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
        topicPerson?: number;
        trans: string;
        /// artist detail additional
        img1v1Id_str: string;
        mvSize: number;
        picId_str: string;
    }

    // playlist detail
    export interface Playlist {
        adType: number;
        backgroundCoverId: number;
        backgroundCoverUrl: null;
        cloudTrackCount: number;
        commentCount: number;
        commentThreadId: string;
        coverImgId: number;
        coverImgId_str: string;
        coverImgUrl: string;
        createTime: number;
        creator: Creator;
        description: string;
        englishTitle: null;
        highQuality: boolean;
        id: number;
        name: string;
        newImported: boolean;
        opRecommend: boolean;
        ordered: boolean;
        playCount: number;
        privacy: number;
        shareCount: number;
        specialType: number;
        status: number;
        subscribed: boolean;
        subscribedCount: number;
        subscribers: any[];
        tags: string[];
        titleImage: number;
        titleImageUrl: null;
        trackCount: number;
        trackIds: TrackID[];
        trackNumberUpdateTime: number;
        trackUpdateTime: number;
        tracks: any[];
        updateFrequency: null;
        updateTime: number;
        userId: number;
    }

    export interface Creator {
        accountStatus: number;
        authStatus: number;
        authority: number;
        avatarImgId: number;
        avatarImgIdStr: string;
        avatarImgId_str: string;
        avatarUrl: string;
        backgroundImgId: number;
        backgroundImgIdStr: string;
        backgroundUrl: string;
        birthday: number;
        city: number;
        defaultAvatar: boolean;
        description: string;
        detailDescription: string;
        djStatus: number;
        expertTags: null;
        experts: null;
        followed: boolean;
        gender: number;
        mutual: boolean;
        nickname: string;
        province: number;
        remarkName: null;
        signature: string;
        userId: number;
        userType: number;
        vipType: number;
    }

    export interface TrackID {
        alg: null;
        id: number;
        v: number;
    }

    // fm
    export interface SongWithLongFields {
        album: Album;
        alias: string[];
        artists: Artist[];
        audition: any;
        bMusic: Music;
        commentThreadId: string;
        copyFrom: string;
        copyright?: number;
        copyrightId: number;
        crbt: any;
        dayPlays: number;
        disc: string;
        duration: number;
        fee: number;
        ftype: number;
        hMusic: Music;
        hearTime: number;
        id: number;
        lMusic: Music;
        mMusic: Music;
        mark: number;
        mp3Url: any;
        mvid: number;
        name: string;
        no: number;
        playedNum: number;
        popularity: number;
        position: number;
        privilege?: Privilege;
        ringtone?: string;
        rtUrl: any;
        rtUrls: any[];
        rtype: number;
        rurl: any;
        score: number;
        sign?: any;
        starred: boolean;
        starredNum: number;
        status: number;
        transName?: string;
    }

    export interface Music {
        bitrate: number;
        dfsId: number;
        /** usually `'mp3'` */
        extension: string;
        id: number;
        name: null;
        playTime: number;
        size: number;
        sr: number;
        volumeDelta: number;
    }

    export interface FmSong extends SongWithLongFields {
        alg: string;
    }

    // recommend
    export interface Recommend extends FmSong {
        reason: string;
    }

    // djradio
    export interface DjRadio {
        category: string;
        categoryId: number;
        commentCount: number;
        commentDatas: DjRadioComment[];
        createTime: number;
        desc: string;
        dj: Dj;
        feeInfo?: any;
        feeScope: number;
        id: number;
        lastProgramCreateTime: number;
        lastProgramId: number;
        likedCount: number;
        name: string;
        picId: number;
        picUrl: string;
        programCount: number;
        radioFeeType: number;
        rcmdText: string;
        shareCount: number;
        subCount: number;
        subed: boolean;
    }

    export interface DjRadioComment {
        commentId: number;
        content: string;
        programId: number;
        programName: string;
        userProfile: Dj;
    }

    export interface Dj extends Profile {
        avatarImgIdStr: string;
        avatarImgId_str: string;
        backgroundImgIdStr: string;
        brand?: string;
        canReward?: boolean;
        rewardCount?: number;
    }

    // djradio program
    export interface Program {
        alg?: string;
        auditStatus: number;
        bdAuditStatus: number;
        blurCoverUrl: string;
        buyed: boolean;
        canReward: boolean;
        channels: any[];
        commentCount: number;
        commentThreadId: string;
        coverUrl: string;
        createTime: number;
        description: string;
        dj: Dj;
        duration: number;
        feeScope: number;
        h5Links?: any;
        id: number;
        isPublish: boolean;
        likedCount: number;
        listenerCount: number;
        liveInfo?: any;
        mainSong: SongWithLongFields;
        mainTrackId: number;
        name: string;
        programDesc?: any;
        programFeeType: number;
        pubStatus: number;
        radio: DjRadioInner;
        reward: boolean;
        score: number;
        serialNum: number;
        shareCount: number;
        smallLanguageAuditStatus: number;
        songs?: any;
        subscribed: boolean;
        subscribedCount: number;
        titbitImages?: any;
        titbits?: any;
        trackCount: number;
        videoInfo?: any;
    }

    export interface DjRadioInner {
        buyed: boolean;
        category: string;
        categoryId: number;
        createTime: number;
        desc: string;
        discountPrice: null;
        dj: null;
        feeScope: number;
        finished: boolean;
        id: number;
        lastProgramCreateTime: number;
        lastProgramId: number;
        lastProgramName: null;
        liveInfo: null;
        name: string;
        originalPrice: number;
        picId: number;
        picUrl: string;
        price: number;
        programCount: number;
        purchaseCount: number;
        radioFeeType: number;
        subCount: number;
        subed: boolean;
        underShelf: boolean;
        videos: null;
    }
}

export as namespace EApi;
