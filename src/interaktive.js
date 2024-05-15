import { getIPSocket, likertPercentage } from "./services.js";
import { createTeam } from "./team.js";
import { likertField, resultsBoard,showPercentage } from "./draw.js";
import { addSubmitOnReturn } from "./listeners.js";


// run a function on all div elements with type=fun.name
export function runFunction(fun) {
    console.log(`run ${fun.name}`);
    const elements = document.querySelectorAll(`div[type=${fun.name}]`);

    elements.forEach(element => {
        console.log(`execute ${fun.name} at element: ${element.id}`);
        fun(element);
    });
}

/////////////////////////////////////////////////////////////////////////////////////

export async function showIPSocket(ipSocketElement) {
    const ipSocket = await getIPSocket();
    ipSocketElement.innerHTML = `http://${ipSocket.ip}:${ipSocket.socketNr}/`;
    }


export function goFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        document.documentElement.msRequestFullscreen();
    }
}

export function teamCollection(teamElement) {
    // Create the <div> element with id="svg-team"
    const svgTeamDiv = document.createElement('div');
    svgTeamDiv.id = 'svg-team';

    // Create the <div> element with class="toast-container" and id="toast-container"
    const toastContainerDiv = document.createElement('div');
    toastContainerDiv.className = 'toast-container';
    toastContainerDiv.id = 'toast-container';


    // Alternatively, you can append them to a specific parent element
    teamElement.appendChild(svgTeamDiv);
    teamElement.appendChild(toastContainerDiv);
    createTeam();
}

/////////////////////////////////////////////////////////////////////////////////////

export function inputField(inputElement) {
    // Create the form element
    const form = document.createElement('form');

    // Create the input element
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.name = 'input';
    inputField.style.width = '300px';

    // Append the input field to the form
    form.appendChild(inputField);

    // Append the form to the body (or any other parent element)
    inputElement.appendChild(form);

    // regoster the submitOnReturn function to the input field
    addSubmitOnReturn(inputField, inputElement.id);
};

export async function inputCollection(collectionElement){
    console.log('inputCollection', collectionElement);
    // get data ref attribute
    const qid = collectionElement.getAttribute('data-ref');
    console.log('qid', qid);
    const argConfig = JSON.parse(collectionElement.getAttribute('data-argConfig'));
    await resultsBoard(collectionElement, argConfig);
}

/////////////////////////////////////////////////////////////////////////////////////

export function pollField(pollElement) {
    likertField(pollElement);
}

export async function pollPercentage(percentageElement){
    // create button
    showPercentage(percentageElement);
    
}