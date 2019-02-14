import { EventEmitter } from 'events';

import debug from 'debug';
import { BigInt } from 'jsbi';
import { sessionBus, Variant, interface as iface, setBigIntCompat } from 'dbus-next';

import { Timer } from './timer';

setBigIntCompat(true);

const {
    Interface,
    property,
    method,
    signal,
    ACCESS_READ,
    ACCESS_READWRITE
} = iface;

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
    serviceName += '.debug';
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
        this._Metadata = {
            'mpris:trackid': new Variant('s', i.path(value.id)),
            'mpris:length': new Variant('x', value.duration * 1e3),
            'mpris:artUrl': new Variant('s', value.album.picUrl || 'file:///dev/null'),
            'xesam:album': new Variant('s', value.album.name || '未知专辑'),
            'xesam:artist': new Variant('as', [value.artistName || '未知歌手']),
            'xesam:discNumber': new Variant('n', Number.parseInt(value.cd, 10) || 0),
            'xesam:title': new Variant('s', value.name || '未知歌曲'),
            'xesam:trackNumber': new Variant('n', value.no || 0),
        };
        d('property: Metadata %o', this._Metadata);
        Interface.emitPropertiesChanged(this, {
            Metadata: this._Metadata
        });
        this.timer.reset();
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
    }

    @property({ signature: 's', access: ACCESS_READWRITE })
    get LoopStatus() {
        return this._LoopStatus.value;
    }

    set LoopStatus(value) {
        this._LoopStatus.value = value;
        Interface.emitPropertiesChanged(this, {
            Metadata: this._LoopStatus.value
        });
    }

    @property({ signature: 'b', access: ACCESS_READWRITE })
    Shuffle = false;

    @property({ signature: 'd', access: ACCESS_READWRITE })
    Volume = 1.0;

    @property({ signature: 'd', access: ACCESS_READWRITE })
    Rate = 1.0;

    @property({ signature: 'd', access: ACCESS_READ })
    MinimumRate = 1.0;

    @property({ signature: 'd', access: ACCESS_READ })
    MaximumRate = 1.0;

    _Position = {
        value: 0
    };

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

    @method({ inSignature: 'ox' })
    SetPosition(TrackId, Position) {
        d('method: SetPosition %s %d', TrackId, Position);
        const pos = Number.parseInt(Position / BigInt(1e6));
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
        this.bindEvent();
        this.exportInterface();
    }

    bindEvent() {
        this.on('play', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Playing));
        this.on('pause', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Paused));
        this.on('stop', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Stopped));
        this.on('loopStatus', val => this.mp2Player.LoopStatus = val);
        this.on('shuffle', shuf => this.mp2Player.Shuffle = shuf);
        this.on('metadata', meta => this.mp2Player.setMetadata(meta));
        this.on('volume', vol => this.mp2Player.Volume = vol);
        this.on('seeked', seconds => this.mp2Player.Seeked(seconds));
    }

    exportInterface() {
        bus.export(this.interfaceName, this.objectPath, this.mp2);
        bus.export(this.interfaceName, this.objectPath, this.mp2Player);
    }
}

export default new MPRISEmitter();
