import { EventEmitter } from 'events';

import debug from 'debug';
import dbus from 'dbus-native';

import { Timer } from './timer';

const bus = dbus.sessionBus();
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

let identity = 'ElectronNCM';
if (process.env.NODE_ENV === 'development') {
    identity += '.debug';
}

class MediaPlayer2 {
    static get Description() {
        return {
            name: i.name(),
            properties: {
                CanQuit: 'b',
                CanRaise: 'b',
                HasTrackList: 'b',
                Identity: 's',
                DesktopEntry: 's'
            },
            methods: {
                Quit: ['', '', [], []],
                Raise: ['', '', [], []]
            }
        };
    }

    /**
     * @param {EventEmitter} emitter
     */
    constructor(emitter) {
        this.emitter = emitter;
        this.CanQuit = true;
        this.CanRaise = true;
        this.HasTrackList = true;
        this.Identity = identity;
        this.DesktopEntry = 'electron-netease-cloud-music';
    }

    Quit() {
        d('method: Quit');
        this.emitter.emit('dbus:quit');
    }

    Raise() {
        d('method: Raise');
        this.emitter.emit('dbus:raise');
    }
}

class MediaPlayer2Player {
    static get Description() {
        return {
            name: i.name('Player'),
            properties: {
                CanGoNext: 'b',
                CanGoPrevious: 'b',
                CanPlay: 'b',
                CanPause: 'b',
                CanSeek: 'b',
                CanControl: 'b',
                PlaybackStatus: 's',
                LoopStatus: 's',
                Shuffle: 'b',
                Volume: 'd',
                Rate: 'd',
                MinimumRate: 'd',
                MaximumRate: 'd',
                Position: 'x',
                Metadata: 'a{sv}'
            },
            methods: {
                Next: ['', '', [], []],
                Previous: ['', '', [], []],
                Pause: ['', '', [], []],
                Play: ['', '', [], []],
                PlayPause: ['', '', [], []],
                Stop: ['', '', [], []],
                Seek: ['x', '', ['Offset'], []],
                SetPosition: ['ox', '', ['TrackId', 'Position'], []]
            },
            signals: {
                Seeked: ['x', 'Position']
            }
        };
    }

    /**
     * @param {EventEmitter} emitter
     */
    constructor(emitter) {
        this.emitter = emitter;
        this.timer = new Timer();
        // interface properties
        this.CanGoNext = true;
        this.CanGoPrevious = true;
        this.CanPlay = true;
        this.CanPause = true;
        this.CanSeek = true;
        this.CanControl = false;
        this.PlaybackStatus = 'Stopped';
        this._PlaybackStatus = {
            types: {
                Playing: 'Playing',
                Paused: 'Paused',
                Stopped: 'Stopped'
            }
        };
        this.Metadata = [];
        // TODO: LoopStatus, Shuffle, Volume
        this.LoopStatus = 'None';
        this._LoopStatus = {
            types: {
                None: 'None',
                Track: 'Track',
                Playlist: 'Playlist'
            }
        };
        this.Shuffle = false;
        this.Volume = 1.0;
        // useless
        this.Rate = 1.0;
        this.MinimumRate = 1.0;
        this.MaximumRate = 1.0;
    }

    PropertiesChanged(changedProperties, invalidatedProperties = []) {
        const body = [
            i.name('Player'),
            Object.entries(changedProperties),
            invalidatedProperties
        ];
        bus.sendSignal(
            i.path(),
            'org.freedesktop.DBus.Properties',
            'PropertiesChanged',
            'sa{sv}as',
            body
        );
    }

    setCanControl(value) {
        if (value === this.CanControl) return;
        this.CanControl = value;
        d('property: Metadata set to %o', this.Metadata);
        this.PropertiesChanged({ CanControl: ['b', this.CanControl] });
    }

    get Position() {
        const t = this.timer.get();
        d('property: Position get %o, running %o', t, this.timer.running);
        return Math.trunc(t * 1e3);
    }

    setMetadata(value) {
        if (typeof value.id === 'number') {
            this.setCanControl(true);
            this.Metadata = [
                ['mpris:trackid', ['s', i.path(value.id)]],
                ['mpris:length', ['x', value.duration * 1e3]],
                ['mpris:artUrl', ['s', value.album.picUrl || 'file:///dev/null']],
                ['xesam:album', ['s', value.album.name || '未知专辑']],
                ['xesam:artist', ['as', [value.artistName || '未知歌手']]],
                ['xesam:discNumber', ['n', Number.parseInt(value.cd, 10) || 0]],
                ['xesam:title', ['s', value.name || '未知歌曲']],
                ['xesam:trackNumber', ['n', value.no || 0]],
            ];
        } else {
            this.setCanControl(false);
            this.Metadata = [];
        }
        d('property: Metadata set to %o', this.Metadata);
        this.PropertiesChanged({ Metadata: ['a{sv}', this.Metadata] });
        this.timer.reset();
    }

    setPlaybackStatus(val) {
        if (val === this.PlaybackStatus) return;
        this.PlaybackStatus = val;
        this.PropertiesChanged({ PlaybackStatus: ['s', this.PlaybackStatus] });
        switch (this.PlaybackStatus) {
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

    Next() {
        d('method: Next');
        this.emitter.emit('dbus:next');
    }

    Previous() {
        d('method: Previous');
        this.emitter.emit('dbus:prev');
    }

    Pause() {
        d('method: Pause');
        this.setPlaybackStatus(this._PlaybackStatus.types.Paused);
        this.emitter.emit('dbus:pause');
    }

    Play() {
        d('method: Play');
        this.setPlaybackStatus(this._PlaybackStatus.types.Playing);
        this.emitter.emit('dbus:play');
    }

    PlayPause() {
        d('method: PlayPause');
        switch (this.PlaybackStatus) {
            case this._PlaybackStatus.types.Playing:
                this.setPlaybackStatus(this._PlaybackStatus.types.Paused);
                this.emitter.emit('dbus:pause');
                break;
            default:
                this.setPlaybackStatus(this._PlaybackStatus.types.Playing);
                this.emitter.emit('dbus:play');
        }
    }

    Stop() {
        d('method: Stop');
        this.setPlaybackStatus(this._PlaybackStatus.types.Stopped);
        this.emitter.emit('dbus:stop');
    }

    Seek(Offset) {
        d('method: Seek %d', Offset);
        this.emitter.emit('dbus:seek', Offset / 1e6);
        this.timer.offset(Offset / 1e3);
    }

    SetPosition(TrackId, Position) {
        d('method: SetPosition %s %d', TrackId, Position);
        this.emitter.emit('dbus:position', TrackId, Position / 1e6);
        this.timer.set(Position / 1e3);
    }

    /**
     * @signal Seeked
     * @param {number} seconds
     * @signature `x` Position
     */
    Seeked(seconds) {
        this.emit('Seeked', Math.trunc(seconds * 1e6));
        this.timer.set(seconds * 1e3);
    }

    emit(signalName, ...signalOutputParams) {
        d('signal: %s %o', signalName, signalOutputParams);
    }
}

class MPRISEmitter extends EventEmitter {
    constructor() {
        super();
        this.interfaceName = i.name(identity);
        this.objectPath = i.path();
        this.mp2 = new MediaPlayer2(this);
        this.mp2Player = new MediaPlayer2Player(this);
        this.bindEvent();
    }

    bindEvent() {
        this.on('play', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Playing));
        this.on('pause', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Paused));
        this.on('stop', () => this.mp2Player.setPlaybackStatus(this.mp2Player._PlaybackStatus.types.Stopped));
        this.on('metadata', meta => this.mp2Player.setMetadata(meta));
        this.on('seeked', seconds => this.mp2Player.Seeked(seconds));
    }

    exportInterface() {
        bus.exportInterface(this.mp2, this.objectPath, MediaPlayer2.Description);
        bus.exportInterface(this.mp2Player, this.objectPath, MediaPlayer2Player.Description);
    }
}

const emitter = new MPRISEmitter();

export default emitter;

/**
 * @see https://github.com/sidorares/dbus-native/blob/v0.4.0/examples/basic-service.js
 * request our service name to the bus.
 * The 0x4 flag means that we don't want to be queued if the service name we are
 * requesting is already owned by another service; we want to fail instead.
 */
const serviceName = i.name(identity);
bus.requestName(serviceName, 0x4, (err, code) => {
    // If there was an error, warn user and fail
    if (err) {
        /* eslint-disable no-console */
        console.error(`Failed to not request DBus service name '${serviceName}'`);
        console.error(err);
        /* eslint-enable no-console */
    }

    // code 0x1 means we successfully had the name
    if (code === 1) {
        d(`Successfully requested service name %o`, serviceName);
        emitter.exportInterface();
    } else {
        /**
         * Other return codes means various errors, check
         * [here](https://dbus.freedesktop.org/doc/api/html/group__DBusShared.html#ga37a9bc7c6eb11d212bf8d5e5ff3b50f9)
         * for more information
         */
        /* eslint-disable no-console */
        console.error(`Failed to not request DBus service name '${serviceName}'`);
        console.error(`Error code: ${code}`);
        /* eslint-enable no-console */
    }
});
