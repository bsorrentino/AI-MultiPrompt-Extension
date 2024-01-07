export const queryTab = () => chrome.tabs.query({ url: "*://bard.google.com/*" , currentWindow:true})

export const createTab = () => chrome.tabs.create({ url: "https://bard.google.com/" })

/**
 * Submits the given prompt text to the Bard playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
export const submit = (prompt) => {

    const promptElem = document.querySelector("input-area rich-textarea > div");
    if (!promptElem) {
        console.warn("prompt not found!")
        return;
    }
    
    promptElem.innerHTML = prompt

    const buttons = document.querySelectorAll("input-area button");
    
    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];

        // submitButton.click() // just seems doesn't work with one click
        setTimeout( () => {
            submitButton.click()
            // alternative implementation
            // submitButton.dispatchEvent(new Event('click', { 'bubbles': true })); 
        }, 800);
        
    }

}
