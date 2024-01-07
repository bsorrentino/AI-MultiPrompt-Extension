export const queryTab = () => chrome.tabs.query({ url: "*://*.perplexity.ai/*" , currentWindow:true})

export const createTab = () => chrome.tabs.create({ url: "https://www.perplexity.ai/" })

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

    // parentForm.querySelector( "button:last-of-type" ); // doesn't work
    
    let parentElem = promptElem.parentElement
    let buttons = null
    do {
        buttons = parentElem.querySelectorAll("button");
        
        parentElem = parentElem.parentElement
        
    } while( buttons && buttons.length === 0 );
    
    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];
        submitButton.click()
        
    }

}
