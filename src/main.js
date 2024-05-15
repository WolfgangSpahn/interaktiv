// src/main.js
import * as ia from './interaktiv.js';

console.log('main.js loaded');


// run the functions when the DOM is loaded at every div element with type=fun.name
// this makes the <div type="fun.name"> tag in your HTML act as a function call
document.addEventListener('DOMContentLoaded', () => {
    console.log('populate divs which are bound to functions');
    ia.runFunction(ia.showIPSocket);
    ia.runFunction(ia.goFullScreen);
    ia.runFunction(ia.teamCollection);
    ia.runFunction(ia.inputField);
    ia.runFunction(ia.inputCollection);
    ia.runFunction(ia.pollField);
    ia.runFunction(ia.pollPercentage);
});

// export the functions/variables to the global scope
window.eventSource = ia.eventSource; // variable for the EventSource object
window.goFullScreen = ia.goFullScreen; // function to go full screen

