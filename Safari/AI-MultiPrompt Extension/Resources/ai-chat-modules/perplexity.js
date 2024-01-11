export const queryTab = () => browser.tabs.query({ url: "*://*.perplexity.ai/*" , currentWindow:true})

export const createTab = () => browser.tabs.create({ url: "https://www.perplexity.ai/", pinned: true })

/**
 * Submits the given prompt text to the Perplexity playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
export const submit = (prompt) => {

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
    
    // let parentElem = promptElem.parentElement
    // let buttons = null
    // do {
    //     buttons = parentElem.querySelectorAll("button");
        
    //     parentElem = parentElem.parentElement
        
    // } while( buttons && buttons.length === 0 );
    
    // if (buttons && buttons.length > 0) {

    //     buttons.forEach(b => console.debug("BUTTON => ", b));

    //     const submitButton = buttons[buttons.length - 1];
    //     submitButton.click()
        
    // }

}
