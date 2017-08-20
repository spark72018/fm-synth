const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const CEILING = 8000;

var oscillator;
const pressed = {};
const oscillatorsMade = {};
const modsMade = {};
const lfosMade = {};
var currentWave;
var currentOctave;
var currentModulator;
var currentModulatorGainValue;
var currentWaveshapeGainValue;
var lfoWave;
var lfoFreqValue;

// type can be 'sine', 'square', 'sawtooth', or 'triangle'

const keyboard = document.getElementById('keycontainer');
const waveshape = document.getElementById('waveshape');
const octave = document.getElementById('octave');
const modulator = document.getElementById('modulator');
const modulatorRangeTag = document.getElementById('modulatorRangeTag');
const waveshapeGainRangeTag = document.getElementById('waveshapeGainRangeTag');
const lfoWaveTag = document.getElementById('lfoWave');
const lfoRangeTag = document.getElementById('lfoTag');

currentWave = waveshape.value;
currentModulatorGainValue = modulatorRangeTag.value;
currentWaveshapeGainValue = waveshapeGainRangeTag.value;
lfoWave = lfoWaveTag.value;
lfoFreqValue = lfoRangeTag.value;

waveshape.onchange = (e) => {
    currentWave = e.target.value;
} 

octave.onchange = (e) => {
    currentOctave = e.target.value;
}

modulator.onchange = (e) => {
    currentModulator = e.target.value;
}

modulatorRangeTag.onchange = (e) => {
    let multiplier = parseFloat(e.target.value).toFixed(10);
    currentModulatorGainValue = multiplier * CEILING.toFixed(10);
}

waveshapeGainRangeTag.onchange = (e) => {
    currentWaveshapeGainValue = parseFloat(e.target.value).toFixed(10);
}

lfoWaveTag.onchange = (e) => {
    lfoWave = e.target.value;
}

lfoRangeTag.onchange = (e) => {
    lfoFreqValue = parseFloat(e.target.value).toFixed(10);
}

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
function setAndStartOsc(num, str, octave = 1) {
    oscillatorsMade[num] = audioCtx.createOscillator();
    var finalFrequency;
    var octaveNum = parseFloat(octave).toFixed(5);
    console.log('octaveNum is', octaveNum);
    switch(parseInt(num, 10)) {
        case 65: // 'a' key
            finalFrequency = 261.63 * octaveNum;
            break;
        case 83: // 's' key
            finalFrequency = 277.18 * octave;
            break;
        case 68: // 'd' key
            finalFrequency = 293.66 * octave;
            break;
        case 70: // 'f' key
            finalFrequency = 311.13 * octave;
            break;
        case 71: // 'g' key
            finalFrequency = 329.63 * octave;
            break;
        case 72: // 'h' key
            finalFrequency = 349.23 * octave;
            break;
        case 74: // 'j' key
            finalFrequency = 369.99 * octave;
            break;
        case 75: // 'k' key
            finalFrequency = 392.00 * octave;
            break;
        case 76: // 'l' key
            finalFrequency = 415.30 * octave;
            break;
        case 84: // 't' key
            finalFrequency = 440.00 * octave;
            break;
        case 89: // ' y ' key
            finalFrequency = 466.16 * octave;
            break;
        case 85: // ' u ' key
            finalFrequency = 493.88 * octave;
            break;
        case 73: // 'i' key
            finalFrequency = 523.25 * octave;
            break;
        case 79: // 'o' key
            finalFrequency = 554.37 * octave;
            break;
        case 80: // 'p' key
            finalFrequency = 587.33 * octave;
            break;
        default:
            finalFrequency = 0;
            break;
    }    
    oscillatorsMade[num].type = str; 
    oscillatorsMade[num].frequency.value = finalFrequency;
    const out = audioCtx.destination;
    const carrierGain = audioCtx.createGain();
    carrierGain.gain.value = currentWaveshapeGainValue;    
    if(currentModulator) {
        modsMade[num] = audioCtx.createOscillator();
        modsMade[num].type = currentModulator;
        modsMade[num].frequency.value = finalFrequency;
        const modGain = audioCtx.createGain();
        modGain.gain.value = currentModulatorGainValue;
        modsMade[num].connect(modGain);
        modGain.connect(oscillatorsMade[num].frequency);
        modsMade[num].start();
    }else {
        if(modsMade[num]) {
            modsMade[num].disconnect();
        }
    }
    if(lfoFreqValue > 0) {
        console.log('in lfo block', lfoFreqValue);
        lfosMade[num] = audioCtx.createOscillator();
        lfosMade[num].type = lfoWave;
        lfosMade[num].frequency.value = lfoFreqValue;
        const lfoGain = audioCtx.createGain();
        const gain = audioCtx.createGain();
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
    if(pressed[e.keyCode]) return;
    pressed[e.keyCode] = true;
    setAndStartOsc(e.keyCode, currentWave, currentOctave);
}

function handleUp(e) {
    pressed[e.keyCode] = false;
    stopOsc();
}

function startOsc() {
    for(let key in pressed) {
        if(pressed[key]) {
            setAndStartOsc(key, currentWave, currentOctave);
        }
        if(lfosMade[key]) {
            lfosMade[key].start();
        }
    }
}

function stopOsc() {
    let keys = Object.keys(pressed);
    for(let key of keys) {
        if(!pressed[key]) {
            oscillatorsMade[key].stop();
            oscillatorsMade[key].disconnect();
        }
        if(lfosMade[key]) {
            console.log(lfosMade[key]);
            lfosMade[key].stop();
            lfosMade[key].disconnect();
        }
    }
}