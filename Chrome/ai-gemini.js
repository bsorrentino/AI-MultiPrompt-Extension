import { AIToggle } from "./ai-toggle.js";

/**
 * Submits the given prompt text to the Gemini playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const submit = (prompt) => {

    const promptElem = document.querySelector("input-area-v2 rich-textarea > div");
    if (!promptElem) {
        console.warn("prompt not found!")
        return;
    }
    
    promptElem.innerHTML = prompt

     // Create a new KeyboardEvent
     const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true, // Make sure the event bubbles up through the DOM
        cancelable: true, // Allow it to be canceled
        key: 'Enter', // Specify the key to be 'Enter'
        code: 'Enter', // Specify the code to be 'Enter' for newer browsers
        which: 13 // The keyCode for Enter key (legacy property)
    });
    
    // Dispatch the event on the textarea element
    setTimeout( () => promptElem.dispatchEvent(enterEvent), 800);
        
}


class GeminiComponent extends AIToggle {

    constructor() {
        super();
        this.setAttribute( "queryTabUrl", "*://gemini.google.com/*" )
        this.setAttribute( "createTabUrl", "https://gemini.google.com/" )
        this.submitClosure = submit
    }

}

customElements.define('ai-gemini', GeminiComponent);