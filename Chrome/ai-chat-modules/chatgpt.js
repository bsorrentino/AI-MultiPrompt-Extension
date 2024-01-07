export const queryTab = () => chrome.tabs.query({ url: "*://*.openai.com/*", currentWindow:true })

export const createTab = () => chrome.tabs.create({ url: "https://chat.openai.com/" })

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

    promptElem.value = prompt;

    promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));

    const parentForm = promptElem.closest("form");

    console.debug("FORM => ", parentForm);

    const buttons = parentForm.querySelectorAll("button");

    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];
        submitButton.click();

    }

}
