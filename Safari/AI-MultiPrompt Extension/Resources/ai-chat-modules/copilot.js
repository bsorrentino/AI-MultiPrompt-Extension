export const queryTab = () => browser.tabs.query({ url: "*://copilot.microsoft.com/*" , currentWindow:true})

export const createTab = () => browser.tabs.create({ url: "https://copilot.microsoft.com/", pinned: true })

/**
 * Submits the given prompt text to the Bard playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
export const submit = (prompt) => {

    const rootElem = document.querySelector('cib-serp');
    if( !rootElem) {
        console.warn("COPILOT: 'cib-serp' not found!")
        return;
    }
    const actionBar = rootElem.shadowRoot.querySelector('cib-action-bar');
    if(!actionBar) {
        console.warn("COPILOT: 'cib-action-bar' not found!")
        return;
    }
    const inputElem  = actionBar.shadowRoot.querySelector('cib-text-input');
    if(!inputElem) {
        console.warn("COPILOT: 'cib-text-input' not found!")
        return;
    }

    const promptElem = inputElem.shadowRoot.querySelector('#searchboxform #searchbox');
    
    if (!promptElem) {
        console.warn("COPILOT: '#searchboxform #searchbox' not found!")
        return;
    }
    
    // console.debug( "promptElem:", promptElem );

    promptElem.value = prompt;
    promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));
    

    const buttons = actionBar.shadowRoot.querySelectorAll(".bottom-controls button");
    
    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];

        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
        submitButton.dispatchEvent(clickEvent);
        
        // submitButton.focus();
        // submitButton.click();
        
    }
    
}
