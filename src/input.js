function submitForm(inputId, formId) {
    var value = document.getElementById(inputId).value;
    // alert(localStorage.getItem('uuid') + ' entered: ' + value);
    doFetch("answer", "POST", {"answer": value, "qid":formId, "uuid":localStorage.getItem('uuid')}, null) ;
    }

export function submitOnReturn(inputFieldId, formId) {
    domReady(function () {
        const inputField = document.getElementById(inputFieldId);

        inputField.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent the form from submitting in the default way
                console.log('Enter pressed to submit the form', inputField, inputField.value, formId);

                // Assuming submitForm takes the input field's value and the form's id
                submitForm(inputFieldId, formId);
                inputField.value = ''; // Clear the input field
            }
        });
    });
}