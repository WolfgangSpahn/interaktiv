import {doFetch} from "./services.js";

export async function addSubmitOnReturn(inputField, formId) {
        inputField.addEventListener('keydown', async function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent the form from submitting in the default way
                console.log('Enter pressed to submit the form', inputField, inputField.value, formId);

                // Assuming submitForm takes the input field's value and the form's id
                var value = inputField.value;
                await doFetch("answer", "POST", {"answer": value, "qid":formId, "uuid":localStorage.getItem('uuid')}, null) ;
                inputField.value = ''; // Clear the input field
            }
        });

}