// src/main.js
import * as ia from './interaktive.js';

console.log('main.js loaded');

// create an EventSource object for the server-sent events
const eventSource = new EventSource('events');

document.addEventListener('DOMContentLoaded', () => {
    // run showIPSocket function on all div elements with type=showIPSocket
    console.log('populate divs which are bound to functions');
    ia.runFunction(ia.showIPSocket);
    ia.runFunction(ia.goFullScreen);
    ia.runFunction(ia.teamCollection);
    ia.runFunction(ia.inputField);
    ia.runFunction(ia.inputCollection);
    ia.runFunction(ia.pollField);
    ia.runFunction(ia.pollPercentage);

});

window.eventSource = eventSource;

