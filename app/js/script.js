'use strict';

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var CEILING = 8000;
/*
    -reverb?
    -pics of wave somewhere on synth
*/
var oscillator;
var pressed = {};
var oscillatorsMade = {};
var modsMade = {};
var lfosMade = {};
var currentWave;
var currentOctave;
var currentModulator;
var currentModulatorGainValue;
var currentWaveshapeGainValue;
var lfoWave;
var lfoFreqValue;

// type can be 'sine', 'square', 'sawtooth', or 'triangle'

var keyboard = document.getElementById('keycontainer');
var waveshape = document.getElementById('waveshape');
var octave = document.getElementById('octave');
var modulator = document.getElementById('modulator');
var modulatorRangeTag = document.getElementById('modulatorRangeTag');
var waveshapeGainRangeTag = document.getElementById('waveshapeGainRangeTag');
var lfoWaveTag = document.getElementById('lfoWave');
var lfoRangeTag = document.getElementById('lfoTag');

currentWave = waveshape.value;
currentModulatorGainValue = modulatorRangeTag.value;
currentWaveshapeGainValue = waveshapeGainRangeTag.value;
lfoWave = lfoWaveTag.value;
lfoFreqValue = lfoRangeTag.value;

waveshape.onchange = function (e) {
    currentWave = e.target.value;
};

octave.onchange = function (e) {
    currentOctave = e.target.value;
};

modulator.onchange = function (e) {
    currentModulator = e.target.value;
};

modulatorRangeTag.onchange = function (e) {
    var multiplier = parseFloat(e.target.value).toFixed(10);
    currentModulatorGainValue = multiplier * CEILING.toFixed(10);
};

waveshapeGainRangeTag.onchange = function (e) {
    currentWaveshapeGainValue = parseFloat(e.target.value).toFixed(10);
};

lfoWaveTag.onchange = function (e) {
    lfoWave = e.target.value;
};

lfoRangeTag.onchange = function (e) {
    lfoFreqValue = parseFloat(e.target.value).toFixed(10);
};

// var down = false

document.addEventListener('keydown', handleDown, false);
document.addEventListener('keyup', handleUp, false);

/**
 * 
 * @param {Number} num keycode integer
 * @param {String} str string representing type of wave
 * 
 * @return {Object}
 */
function setAndStartOsc(num, str) {
    var octave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    oscillatorsMade[num] = audioCtx.createOscillator();
    var finalFrequency;
    var octaveNum = parseFloat(octave).toFixed(5);
    console.log('octaveNum is', octaveNum);
    switch (parseInt(num, 10)) {
        case 65:
            // 'a' key
            finalFrequency = 261.63 * octaveNum;
            break;
        case 83:
            // 's' key
            finalFrequency = 277.18 * octave;
            break;
        case 68:
            // 'd' key
            finalFrequency = 293.66 * octave;
            break;
        case 70:
            // 'f' key
            finalFrequency = 311.13 * octave;
            break;
        case 71:
            // 'g' key
            finalFrequency = 329.63 * octave;
            break;
        case 72:
            // 'h' key
            finalFrequency = 349.23 * octave;
            break;
        case 74:
            // 'j' key
            finalFrequency = 369.99 * octave;
            break;
        case 75:
            // 'k' key
            finalFrequency = 392.00 * octave;
            break;
        case 76:
            // 'l' key
            finalFrequency = 415.30 * octave;
            break;
        case 186:
            // ';' key
            finalFrequency = 440.00 * octave;
            break;
        case 222:
            // ' ' ' key
            finalFrequency = 466.16 * octave;
            break;
        case 79:
            // ' o ' key
            finalFrequency = 493.88 * octave;
            break;
        case 80:
            // 'p' key
            finalFrequency = 523.25 * octave;
            break;
        case 219:
            finalFrequency = 554.37 * octave;
            break;
        case 221:
            finalFrequency = 587.33 * octave;
            break;
        default:
            finalFrequency = 0;
            break;
    }
    oscillatorsMade[num].type = str;
    oscillatorsMade[num].frequency.value = finalFrequency;
    var out = audioCtx.destination;
    var carrierGain = audioCtx.createGain();
    carrierGain.gain.value = currentWaveshapeGainValue;
    if (currentModulator) {
        modsMade[num] = audioCtx.createOscillator();
        modsMade[num].type = currentModulator;
        modsMade[num].frequency.value = finalFrequency;
        var modGain = audioCtx.createGain();
        modGain.gain.value = currentModulatorGainValue;
        modsMade[num].connect(modGain);
        modGain.connect(oscillatorsMade[num].frequency);
        modsMade[num].start();
    } else {
        if (modsMade[num]) {
            modsMade[num].disconnect();
        }
    }
    if (lfoFreqValue > 0) {
        console.log('in lfo block', lfoFreqValue);
        lfosMade[num] = audioCtx.createOscillator();
        lfosMade[num].type = lfoWave;
        lfosMade[num].frequency.value = lfoFreqValue;
        var lfoGain = audioCtx.createGain();
        var gain = audioCtx.createGain();
        gain.gain.value = 0.5;
        lfoGain.gain.value = 0.8;
        lfosMade[num].connect(lfoGain);
        lfoGain.connect(carrierGain.gain);
        lfosMade[num].start();
    }
    oscillatorsMade[num].connect(carrierGain);
    carrierGain.connect(out);
    oscillatorsMade[num].start();
}

function handleDown(e) {
    console.log(e.keyCode);
    //if(down) return;
    //down = true;
    if (pressed[e.keyCode]) return;
    pressed[e.keyCode] = true;
    setAndStartOsc(e.keyCode, currentWave, currentOctave);
}

function handleUp(e) {
    pressed[e.keyCode] = false;
    stopOsc();
}

function startOsc() {
    for (var key in pressed) {
        if (pressed[key]) {
            setAndStartOsc(key, currentWave, currentOctave);
        }
        if (lfosMade[key]) {
            lfosMade[key].start();
        }
    }
}

function stopOsc() {
    var keys = Object.keys(pressed);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if (!pressed[key]) {
                oscillatorsMade[key].stop();
                oscillatorsMade[key].disconnect();
            }
            if (lfosMade[key]) {
                console.log(lfosMade[key]);
                lfosMade[key].stop();
                lfosMade[key].disconnect();
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

/*
-put in some simple melodies for people to try out
*/