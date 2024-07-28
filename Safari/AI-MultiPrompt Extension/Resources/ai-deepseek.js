import { AIToggle } from "./ai-toggle.js";

/**
 * Submits the given prompt text to the Deepseek playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const submit = (prompt) => {

    const promptElem = document.querySelector("textarea");
    if (!promptElem) {
        console.warn("prompt not found!")
        return;
    }
    promptElem.value = prompt;
    promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));
    
    // Create a new KeyboardEvent
    const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true, // Make sure the event bubbles up through the DOM
        cancelable: true, // Allow it to be canceled
        key: 'Enter', // Specify the key to be 'Enter'
        code: 'Enter', // Specify the code to be 'Enter' for newer browsers
        which: 13 // The keyCode for Enter key (legacy property)
    });
    
    // Dispatch the event on the textarea element
    promptElem.dispatchEvent(enterEvent);
}

class DeepseekComponent extends AIToggle {

    constructor() {
        super();
        this.setAttribute( "queryTabUrl", "*://chat.deepseek.com/*" ); 
        this.setAttribute( "createTabUrl", "https://chat.deepseek.com/" ); 
        this.submitClosure = submit
    }

}

customElements.define('ai-deepseek', DeepseekComponent);