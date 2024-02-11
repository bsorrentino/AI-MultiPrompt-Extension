export const queryTab = () => browser.tabs.query({ url: "*://gemini.google.com/*" , currentWindow:true})

export const createTab = () => browser.tabs.create({ url: "https://gemini.google.com/", pinned: true })

/**
 * Submits the given prompt text to the Gemini playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
export const submit = (prompt) => {

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
