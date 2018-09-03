'use strict';

/**
 * Partial implement for MPRIS D-Bus Interface Specification
 * @see https://specifications.freedesktop.org/mpris-spec/latest/index.html
 */

// Just let it keep going with CommonJS .......
const { EventEmitter } = require('events');

const DBus = require('dbus');
const debug = require('debug');

const d = debug('MPRIS');
const emitter = new EventEmitter();

// global name and path
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

// initialize dbus service
const service = DBus.registerService('session', i.name('ElectronNCM'));
const object = service.createObject(i.path());
// update PropertiesChanged signal signature
object.propertyInterface.addSignal('PropertiesChanged', {
    types: [
        { type: 's', name: 'interface_name' },
        { type: 'a{sv}', name: 'changed_properties' },
        { type: 'as', name: 'invalidated_properties' }
    ]
});
object.propertyInterface.update();

// Helper functions
function makeReadonly(type, value) {
    return {
        type: { type },
        getter(cb) { cb(null, value); }
    };
}

function makeProp(name, value, type) {
    return {
        type,
        _name: name,
        _value: value,
        get value() { return this._value; },
        set value(val) {
            this._value = val;
            d(`${name} set to ${typeof this._value} ${this._value}`);
            object.propertyInterface.emitSignal(
                'PropertiesChanged',      // signal_name
                i.name('Player'),         // interface_name
                { [name]: this._value },  // changed_properties
                []                        // invalidated_properties
            );
        }
    };
}

function makeGetter(prop) {
    return {
        getter(cb) { cb(null, prop.value); }
    };
}

function makeGetterSetter(prop) {
    return {
        ...makeGetter(prop),
        setter(val, done) {
            prop.value = val;
            done();
        }
    };
}

/**
 * Interface MediaPlayer2
 * @see https://specifications.freedesktop.org/mpris-spec/latest/Media_Player.html
 */
const IMP2 = object.createInterface(i.name());

// Interface MediaPlayer2 => readonly properties
IMP2.addProperty('CanQuit', makeReadonly('b', true));
IMP2.addProperty('CanRaise', makeReadonly('b', true));
IMP2.addProperty('HasTrackList', makeReadonly('b', false));
IMP2.addProperty('Identity', makeReadonly('s', 'Electron Netease Cloud Music'));
IMP2.addProperty('DesktopEntry', makeReadonly('s', 'electron-netease-cloud-music'));
IMP2.addProperty('SupportedUriSchemes', makeReadonly('as', ['http', 'https']));
IMP2.addProperty('SupportedMimeTypes', makeReadonly('as', ['audio/mpeg']));

// Interface MediaPlayer2 => methods
IMP2.addMethod('Quit', {}, () => {
    emitter.emit('dbus:quit');
    d('Quit Now');
});

IMP2.addMethod('Raise', {}, () => {
    emitter.emit('dbus:raise');
    d('Raise Now');
});

// Interface MediaPlayer2 => Apply update
IMP2.update();

/**
 * Interface MediaPlayer2.Player
 * @see https://specifications.freedesktop.org/mpris-spec/latest/Player_Interface.html
 */
const IMP2Player = object.createInterface(i.name('Player'));

// Interface MediaPlayer2 => readonly properties
IMP2Player.addProperty('CanGoNext', makeReadonly('b', true));
IMP2Player.addProperty('CanGoPrevious', makeReadonly('b', true));
IMP2Player.addProperty('CanPlay', makeReadonly('b', true));
IMP2Player.addProperty('CanPause', makeReadonly('b', true));
IMP2Player.addProperty('CanSeek', makeReadonly('b', true));
IMP2Player.addProperty('CanControl', makeReadonly('b', true));

// Interface MediaPlayer2 => Properties
const PlaybackStatus = makeProp('PlaybackStatus', 'Stopped', {
    Playing: 'Playing', Paused: 'Paused', Stopped: 'Stopped'
});

IMP2Player.addProperty(PlaybackStatus._name, {
    type: DBus.Define(String),
    ...makeGetter(PlaybackStatus)
});

emitter.on('play', () => PlaybackStatus.value = PlaybackStatus.type.Playing);
emitter.on('pause', () => PlaybackStatus.value = PlaybackStatus.type.Paused);
emitter.on('stop', () => PlaybackStatus.value = PlaybackStatus.type.Stopped);

const LoopStatus = makeProp('LoopStatus', 'Playlist', {
    None: 'None', Track: 'Track', Playlist: 'Playlist'
});

IMP2Player.addProperty(LoopStatus._name, {
    type: DBus.Define(String),
    ...makeGetterSetter(LoopStatus)
});

emitter.on('loopStatus', loop => LoopStatus.value = loop);

const Rate = makeProp('Rate', 1.0);

IMP2Player.addProperty(Rate._name, {
    type: DBus.Define(Number),
    ...makeGetterSetter(Rate)
});

emitter.on('rate', rate => Rate.value = rate);

const Shuffle = makeProp('Shuffle', false);

IMP2Player.addProperty('Shuffle', {
    type: DBus.Define(Boolean),
    ...makeGetterSetter(Shuffle)
});

emitter.on('shuffle', shuf => Shuffle.value = shuf);

/**
 * If there is a current track, this must have a "mpris:trackid"
 * entry (of D-Bus type "o") at the very least, which contains
 * a D-Bus path that uniquely identifies this track.
 * @see https://specifications.freedesktop.org/mpris-spec/latest/Player_Interface.html#Property:Metadata
 * @see https://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
 */
const Metadata = makeProp('Metadata', {});

IMP2Player.addProperty('Metadata', {
    type: DBus.Define(Object),
    ...makeGetter(Metadata)
});

emitter.on('metadata', meta => {
    if (!meta['mpris:trackid']) {
        meta['mpris:trackid'] = i.path(meta.id || Date.now());
    }
    Metadata.value = meta;
});

emitter.on('patchMetadata', patch => {
    Metadata.value = Object.assign({}, Metadata._value, patch);
});

const Volume = makeProp('Volume', 1.0);

IMP2Player.addProperty('Volume', {
    type: DBus.Define(Number),
    ...makeGetterSetter(Volume)
});

/**
 * The `org.freedesktop.DBus.Properties.PropertiesChanged` signal
 * is *not* emitted when this property changes.
 */
IMP2Player.addProperty('Position', {
    type: DBus.Define(Number),
    getter(cb) {
        const cnt = emitter.listenerCount('getPosition');
        if (cnt === 0) {
            return cb(null, 0);
        }
        emitter.emit('getPosition', cb);
    }
});

const MinimumRate = makeProp('MinimumRate', 0);

IMP2Player.addProperty('MinimumRate', {
    type: DBus.Define(Number),
    ...makeGetter(MinimumRate)
});

const MaximumRate = makeProp('MaximumRate', 1.0);

IMP2Player.addProperty('MaximumRate', {
    type: DBus.Define(Number),
    ...makeGetter(MaximumRate)
});

// Interface MediaPlayer2.Player => Methods
IMP2Player.addMethod('Next', {}, () => {
    emitter.emit('dbus:next');
    d('Switch Next');
});

IMP2Player.addMethod('Previous', {}, () => {
    emitter.emit('dbus:prev');
    d('Switch Previous');
});

IMP2Player.addMethod('Pause', {}, () => {
    PlaybackStatus.value = PlaybackStatus.type.Paused;
    emitter.emit('dbus:pause');
    d('Let Pause');
});

IMP2Player.addMethod('PlayPause', {}, () => {
    switch (PlaybackStatus._value) {
        case PlaybackStatus.type.Playing:
            PlaybackStatus.value = PlaybackStatus.type.Paused;
            emitter.emit('dbus:pause');
            break;
        default:
            PlaybackStatus.value = PlaybackStatus.type.Playing;
            emitter.emit('dbus:play');
            break;
    }
    d('Toggle PlayPause');
});

IMP2Player.addMethod('Stop', {}, () => {
    PlaybackStatus.value = PlaybackStatus.type.Stopped;
    emitter.emit('dbus:stop');
    d('Let Stop');
});

IMP2Player.addMethod('Play', {}, () => {
    PlaybackStatus.value = PlaybackStatus.type.Playing;
    emitter.emit('dbus:play');
    d('Let Play');
});

IMP2Player.addMethod('Seek', {
    in: [{ type: 'x', name: 'Offset' }]
}, (Offset) => {
    // emit seconds
    emitter.emit('dbus:seek', Offset / 1e6);
    d('Seek to Offset', typeof Offset, Offset);
});

IMP2Player.addMethod('SetPosition', {
    in: [
        { type: 'o', name: 'TrackId' },
        { type: 'x', name: 'Position' }
    ]
}, (TrackId, Position) => {
    emitter.emit('dbus:seek', Position / 1e6);
    d('SetPosition to TrackId', typeof TrackId, TrackId, 'Position', typeof Position, Position);
});

IMP2Player.addMethod('OpenUri', {
    in: [{ type: 's', name: 'Uri' }]
}, (Uri) => {
    emitter.emit('dbus:openuri', Uri);
    d('Open Uri', typeof Uri, Uri);
});

// Interface MediaPlayer2.Player => Signals
/**
 * @see https://specifications.freedesktop.org/mpris-spec/latest/Player_Interface.html#Signal:Seeked
 */
IMP2Player.addSignal('Seeked', {
    types: [{ type: 'x', name: 'Position' }]
});

emitter.on('seeked', seconds => {
    d(`Seeked to ${seconds}`);
    IMP2Player.emitSignal('Seeked', seconds * 1e6);
});

// Interface MediaPlayer2.Player => Apply update
IMP2Player.update();

module.exports = emitter;
