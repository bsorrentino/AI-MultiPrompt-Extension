import { AIToggle } from "./ai-toggle.js";



/**
 * Submits the given prompt text to the OpenAI playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
export const submit = (prompt) => {

    const promptElem = document.querySelector("form #prompt-textarea");

    if (!promptElem) {
        console.warn("prompt not found!");
        return;
    }

    const oldP = promptElem.querySelector("p");
    const text = document.createTextNode(prompt);
    const newP = document.createElement('p');
    newP.appendChild(text);
    oldP.replaceWith( newP );


    const setFocus = ( onElem, timeout = 500 ) => {
        onElem.dispatchEvent(new Event('input', { 'bubbles': true }));
        return new Promise( (resolve, reject) => {
            setTimeout( () => {
                onElem.focus();
                if( document.activeElement === onElem  ) 
                    resolve(true)
                else
                    //reject( )
                    resolve(false)
            }, timeout )
        })
    }
    
    const pressEnter = ( onElem ) => {
        // Create a new KeyboardEvent
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true, // Make sure the event bubbles up through the DOM
            cancelable: true, // Allow it to be canceled
            key: 'Enter', // Specify the key to be 'Enter'
            code: 'Enter', // Specify the code to be 'Enter' for newer browsers
            which: 13 // The keyCode for Enter key (legacy property)
        });
        
        // Dispatch the event on the textarea element
        onElem.dispatchEvent(enterEvent);
    
    }
    
    const retrySetFocusUntilSuccess = ( onElem, retry ) => {
        console.debug( 'focus attempt remaining ', retry );
        if( retry === 0 ) {
            return Promise.reject("prompt refuse the focus") 
        }
    
        return setFocus(onElem)
            .then( () => Promise.resolve() )
            .catch( () => retrySetFocusUntilSuccess( onElem, retry - 1 ) );
    }
    
    retrySetFocusUntilSuccess( promptElem, 3)
        .then( () =>  pressEnter( promptElem ) )
        .catch( (e) =>  console.warn(e.message) );
    
    /*

    const dr = promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));
    console.debug("INPUT => ", dr);

    const parentForm = promptElem.closest("form");
    console.debug("FORM => ", parentForm);

    const buttons = parentForm.querySelectorAll("button");
    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];
        submitButton.click();

    }
    */
}

class CharGPTComponent extends AIToggle {

    constructor() {
        super();
        this.setAttribute("queryTabUrl", "*://chatgpt.com/*" );
        this.setAttribute("createTabUrl", "https://chatgpt.com/" );
        this.submitClosure = submit
    }

}

customElements.define('ai-chatgpt', CharGPTComponent);
