import { EventEmitter } from 'events';

import debug from 'debug';
import throttle from 'lodash/throttle';
import { sessionBus, NameFlag, Variant, interface as DbusInterface } from 'dbus-next';
const { signal, method, property, Interface, ACCESS_READ, ACCESS_READWRITE } = DbusInterface;

import { Timer } from './timer';

const bus = sessionBus();
const d = debug('MPRIS');
const i = {
    name(suffix) {
        if (suffix) return `org.mpris.MediaPlayer2.${suffix}`;
        return 'org.mpris.MediaPlayer2';
    },
    path(suffix) {
        if (suffix) return `/org/mpris/MediaPlayer2/${suffix}`;
        return '/org/mpris/MediaPlayer2';
    }
};

let serviceName = 'ElectronNCM';
if (process.env.NODE_ENV === 'development') {
    serviceName += '.dev';
}

class MediaPlayer2 extends Interface {
    /**
     * @param {string} name
     * @param {EventEmitter} emitter
     */
    constructor(name, emitter) {
        super(name);
        this.emitter = emitter;
    }

    @property({ signature: 'b', access: ACCESS_READ })
    CanQuit = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanRaise = true;

    @property({ signature: 'b', access: ACCESS_READ })
    HasTrackList = false;

    @property({ signature: 's', access: ACCESS_READ })
    Identity = serviceName;

    @property({ signature: 's', access: ACCESS_READ })
    DesktopEntry = 'electron-netease-cloud-music';

    @property({ signature: 'as', access: ACCESS_READ })
    SupportedUriSchemes = ['http', 'https', 'file'];

    @property({ signature: 'as', access: ACCESS_READ })
    SupportedMimeTypes = ['audio/mpeg'];

    @method({})
    Quit() {
        d('method: Quit');
        this.emitter.emit('dbus:quit');
    }

    @method({})
    Raise() {
        d('method: Raise');
        this.emitter.emit('dbus:raise');
    }
}

class MediaPlayer2Player extends Interface {
    /**
     * @param {string} name
     * @param {EventEmitter} emitter
     */
    constructor(name, emitter) {
        super(name);
        this.emitter = emitter;
        this.timer = new Timer();
    }

    @property({ signature: 'b', access: ACCESS_READ })
    CanGoNext = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanGoPrevious = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanPlay = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanPause = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanSeek = true;

    @property({ signature: 'b', access: ACCESS_READ })
    CanControl = true;

    _Metadata = {};

    @property({ signature: 'a{sv}', access: ACCESS_READ })
    get Metadata() {
        return this._Metadata;
    }

    setMetadata(value) {
        d('property: Metadata %o', value);
        if (!value) {
            this._Metadata = {};
        } else {
            const trackid = i.path(value.id);
            /** @type {Variant} */
            const oldId = this._Metadata['mpris:trackid'];
            if (!oldId || oldId.value !== trackid) { this.timer.reset(); }
            this._Metadata = {
                'mpris:trackid': new Variant('o', trackid),
                'mpris:length': new Variant('x', value.duration * 1e3),
                'mpris:artUrl': new Variant('s', value.album.picUrl || 'file:///dev/null'),
                'xesam:album': new Variant('s', value.album.name || '未知专辑'),
                'xesam:artist': new Variant('as', [value.artistName || '未知歌手']),
                'xesam:discNumber': new Variant('n', Number.parseInt(value.cd, 10) || 0),
                'xesam:title': new Variant('s', value.name || '未知歌曲'),
                'xesam:trackNumber': new Variant('n', value.no || 0),
            };
        }
        Interface.emitPropertiesChanged(this, {
            Metadata: this._Metadata
        });
    }

    _PlaybackStatus = {
        value: 'Stopped',
        types: {
            Playing: 'Playing',
            Paused: 'Paused',
            Stopped: 'Stopped'
        }
    };

    @property({ signature: 's', access: ACCESS_READ })
    get PlaybackStatus() {
        return this._PlaybackStatus.value;
    }

    setPlaybackStatus(val) {
        if (this._PlaybackStatus.value === this._PlaybackStatus.types.Stopped && val === this._PlaybackStatus.types.Paused) return;
        this._PlaybackStatus.value = val;
        Interface.emitPropertiesChanged(this, {
            PlaybackStatus: this._PlaybackStatus.value
        });
        switch (this._PlaybackStatus.value) {
            case this._PlaybackStatus.types.Playing:
                this.timer.start();
                break;
            case this._PlaybackStatus.types.Paused:
                this.timer.stop();
                break;
            case this._PlaybackStatus.types.Stopped:
                this.timer.reset();
                break;
        }
    }

    _LoopStatus = {
        value: 'None',
        types: {
            None: 'None',
            Track: 'Track',
            Playlist: 'Playlist'
        }
    };

    @property({ signature: 's', access: ACCESS_READWRITE })
    get LoopStatus() {
        return this._LoopStatus.value;
    }

    set LoopStatus(value) {
        this.setLoopStatus(value);
        this.emitter.emit('dbus:loop', value);
    }

    setLoopStatus(value) {
        this._LoopStatus.value = value;
        Interface.emitPropertiesChanged(this, {
            LoopStatus: this._LoopStatus.value
        });
    }

    _Shuffle = false;

    @property({ signature: 'b', access: ACCESS_READWRITE })
    get Shuffle() { return this._Shuffle; }

    set Shuffle(value) {
        this.setShuffle(value);
        this.emitter.emit('dbus:shuffle', value);
    }

    setShuffle(value) {
        this._Shuffle = value;
        Interface.emitPropertiesChanged(this, {
            Shuffle: this._Shuffle
        });
    }

    _Volume = 1.0;
    _ThrottledVloume = throttle(value => this.emitter.emit('dbus:volume', Math.trunc(value * 100)), 100);

    @property({ signature: 'd', access: ACCESS_READWRITE })
    get Volume() { return this._Volume; }

    set Volume(value) {
        if (Math.abs(this._Volume - value) < 0.01) return;
        this._Volume = value;
        d('set property: Volume %o', this._Volume);
        this._ThrottledVloume(value);
    }

    setVolume(value) {
        this._Volume = value / 100;
        d('setVolume: %o', value);
        Interface.emitPropertiesChanged(this, {
            Volume: this._Volume
        });
    }

    // @property({ signature: 'd', access: ACCESS_READWRITE })
    // Rate = 1.0;

    // @property({ signature: 'd', access: ACCESS_READ })
    // MinimumRate = 1.0;

    // @property({ signature: 'd', access: ACCESS_READ })
    // MaximumRate = 1.0;

    @property({ signature: 'x', access: ACCESS_READ })
    get Position() {
        return BigInt(this.timer.get() * 1e3);
    }

    @method({})
    Next() {
        d('method: Next');
        this.emitter.emit('dbus:next');
    }

    @method({})
    Previous() {
        d('method: Previous');
        this.emitter.emit('dbus:prev');
    }

    @method({})
    Pause() {
        d('method: Pause');
        this.setPlaybackStatus(this._PlaybackStatus.types.Paused);
        this.emitter.emit('dbus:pause');
    }

    @method({})
    Play() {
        d('method: Play');
        this.setPlaybackStatus(this._PlaybackStatus.types.Playing);
        this.emitter.emit('dbus:play');
    }

    @method({})
    PlayPause() {
        d('method: PlayPause');
        switch (this._PlaybackStatus.value) {
            case this._PlaybackStatus.types.Playing:
                this.setPlaybackStatus(this._PlaybackStatus.types.Paused);
                this.emitter.emit('dbus:pause');
                break;
            default:
                this.setPlaybackStatus(this._PlaybackStatus.types.Playing);
                this.emitter.emit('dbus:play');
        }
    }

    @method({})
    Stop() {
        d('method: Stop');
        this.setPlaybackStatus(this._PlaybackStatus.types.Stopped);
        this.emitter.emit('dbus:stop');
    }

    @method({ inSignature: 'x' })
    Seek(Offset) {
        d('method: Seek %d', Offset);
        const offset = Number.parseInt(Offset / BigInt(1e6));
        this.emitter.emit('dbus:seek', offset);
        this.timer.offset(offset * 1e3);
    }

    @method({ inSignature: 's' })
    OpenUri(Uri) {
        d('method: OpenUri, %s', Uri);
        // TODO: fit something here
    }

    @method({ inSignature: 'ox' })
    SetPosition(TrackId, Position) {
        d('method: SetPosition %s %d', TrackId, Position);
        const pos = Number(Position) / 1e6;
        this.emitter.emit('dbus:position', TrackId, pos);
        this.timer.set(pos * 1e3);
    }

    @signal({ signature: 'x' })
    Seeked(seconds) {
        d('signal: Seeked %d', seconds);
        this.timer.set(Math.trunc(seconds * 1e3));
        return BigInt(Math.trunc(seconds * 1e6));
    }
}

class MPRISEmitter extends EventEmitter {
    constructor() {
        super();
        this.interfaceName = i.name(serviceName);
        this.objectPath = i.path();
        this.mp2 = new MediaPlayer2(i.name(), this);
        this.mp2Player = new MediaPlayer2Player(i.name('Player'), this);
        if (process.env.NODE_ENV === 'development') {
            this.mp2.DesktopEntry = 'electron';
        }
        this.bindEvent();
        this.exportInterface();
    }

    bindEvent() {
        this.on('play', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Playing));
        this.on('pause', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Paused));
        this.on('stop', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Stopped));
        this.on('loop', loop => this.mp2Player.setLoopStatus(loop));
        this.on('shuffle', shuffle => this.mp2Player.setShuffle(shuffle));
        this.on('metadata', meta => this.mp2Player.setMetadata(meta));
        this.on('volume', vol => this.mp2Player.setVolume(vol));
        this.on('seeked', seconds => this.mp2Player.Seeked(seconds));
    }

    exportInterface() {
        bus.export(this.objectPath, this.mp2);
        bus.export(this.objectPath, this.mp2Player);
        bus.requestName(this.interfaceName, NameFlag.DO_NOT_QUEUE).catch(e => {
            /* eslint-disable-next-line no-console */
            console.error('Failed to request interface name', this.interfaceName, e);
        });
    }

    async destroy() {
        await bus.releaseName(this.interfaceName);
        bus.disconnect();
    }
}

export default new MPRISEmitter();