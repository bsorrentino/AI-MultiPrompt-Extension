import { AIToggle } from "./ai-toggle.js";

/**
 * Submits the given prompt text to the PHind playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const submit = (prompt) => {

    const promptElem = document.querySelector("form textarea[name='q']");
    if (!promptElem) {
        console.warn("prompt not found!")
        return;
    }
    promptElem.value = prompt;
    promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));

    const submitButton = document.querySelector("form button[type='submit']");
    if( submitButton ) {
        submitButton.click()
    }
    else {
        console.warn( 'sumit button not found! ')
    }
 
    // const parentForm = promptElem.closest('form button')
    // const buttons = parentForm.querySelectorAll("button");

    // if (buttons && buttons.length > 0) {

    //     buttons.forEach(b => console.debug("BUTTON => ", b));

    //     const submitButton = buttons[buttons.length - 1];
    //     submitButton.click()
    // }

}

class PHindComponent extends AIToggle {

    constructor() {
        super();
        this.setAttribute( "queryTabUrl","*://*.phind.com/*" );
        this.setAttribute( "createTabUrl", "https://www.phind.com/" ); 
        this.submitClosure = submit
    }

}

customElements.define('ai-phind', PHindComponent);