
// Logging
const _LL = (msg) => {
    browser.runtime.sendMessage({ log: msg })
}

/**
* Writes a prompt to the active tab's document.
*
* @param {Array<browser.tabs.Tab>} tabs - Array of browser tabs.
* @param {string} prompt - The prompt text to write.
* @param {Function} submitClosure - Callback when prompt is submitted.
*
* @returns {Promise} - Promise that resolves when prompt is written.
*/
function writePrompt(tabs, prompt, submitClosure) {

    if (!tabs || tabs.length === 0) {
        _LL("no tabs found!");
        return;
    }

    _LL("tabsCount: " + tabs.length);

    const tab = tabs[0]

    browser.scripting.executeScript({
        target: {
            tabId: tab.id,
        },
        args: [
            prompt,
        ],
        func: submitClosure
    })
        .then(result => browser.runtime.sendMessage({ result: result }))
        .catch(err => browser.runtime.sendMessage({ result: "error " + err }));
}


/**
 * Submits the given prompt text to the OpenAI playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const openaiSubmit = (prompt) => {

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

/**
 * Submits the given prompt text to the PHind playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const phindSubmit = (prompt) => {

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

/**
 * Submits the given prompt text to the Bard playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const bardSubmit = (prompt) => {

    const promptElem = document.querySelector("input-area rich-textarea > div");
    if (!promptElem) {
        console.warn("prompt not found!")
        return;
    }
    // console.debug("promptElem", promptElem.value)
    
    promptElem.innerHTML = prompt
    // promptElem.value = prompt;
    // promptElem.textContent = prompt;
    // promptElem.innerText = prompt;
    
    //promptElem.dispatchEvent(new Event('input', { 'bubbles': true }));

    // parentForm.querySelector( "button:last-of-type" ); // doesn't work
    const buttons = document.querySelectorAll("input-area button");

    if (buttons && buttons.length > 0) {

        buttons.forEach(b => console.debug("BUTTON => ", b));

        const submitButton = buttons[buttons.length - 1];
        
        submitButton.click()
        submitButton.click() // seems doesn't work with one click
    }

}

/**
 * Submits the given prompt text to the Perplexity playground form.
 * 
 * take note that this function must be serializable to pass to executeScript. Don't call subfunction etc.
 * 
 * @param {string} prompt - The prompt text to submit.
 */
const perplexitySubmit = (prompt) => {

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


/**
 * Settings object to store extension preferences.
 * 
 * @typedef {Object} Settings
 * 
 * @property {boolean} openai - Whether OpenAI integration is enabled.
 * @property {boolean} phind - Whether Anthropic PHind integration is enabled. 
 * @property {boolean} bard - Whether Google Bard integration is enabled.
 * @property {boolean} perplexity - Whether Perplexity AI integration is enabled.
 * @property {string} lastPrompt - Stores the last submitted prompt text.
 */


/**
 * Save Settings in local sorage
 * 
 * @param {Settings} settings
 * @returns {Promise<void>}
 */
const saveSettings = ( settings ) => 
    browser.storage.local.set({ settings: settings })

/**
 * get settings from local storage
 *
 * @return  {Promise<Settings|null>}  promise resolve settings or null if not found
 */
const getSettings = () => 
    browser.storage.local.get("settings" ).then( results => results.settings )


/**
 * @typedef {Object} DetectedAITabs
 * @property {Array<browser.tabs.Tab>} openaiTabs -
 * @property {Array<browser.tabs.Tab>} phindTabs -
 * @property {Array<browser.tabs.Tab>} bardTabs -
 * @property {Array<browser.tabs.Tab>} perplexityTabs -
 */

/**
* Calls the browser.tabs.query method to get the current tabs.
*
* The query filters for tabs that have the specified url and are active.
*
* @returns {Promise<Array<PromiseSettledResult<browser.tabs.Tab>>>} A promise resolving to the matched tabs.
*/
const _queryAITabs = () => Promise.allSettled([
    browser.tabs.query({ url: "*://*.openai.com/*", currentWindow:true }),
    browser.tabs.query({ url: "*://*.phind.com/*" , currentWindow:true}),
    browser.tabs.query({ url: "*://bard.google.com/*" , currentWindow:true}),
    browser.tabs.query({ url: "*://*.perplexity.ai/*" , currentWindow:true}),
])

/**
* Queries for open AI tabs using browser.tabs.query.
*
* @returns {Promise<DetectedAITabs>} A promise that resolves to the detected tabs.
*/
const queryOpenedAITab = () =>

    _queryAITabs().then((queryResult) => {

        if (!queryResult || queryResult.length === 0) {
            return []
        }

        const result = {
            openaiTabs: [],
            phindTabs: [],
            bardTabs: [],
            perplexityTabs: [],
        }

        const [
            openaiTabsResult,
            phindTabsResult,
            bardTabsResult,
            perplexityTabsResult,
        ] = queryResult;

        if (openaiTabsResult.status === "fulfilled" && openaiTabsResult.value.length > 0) {
            result.openaiTabs = openaiTabsResult.value
        }
        if (phindTabsResult.status === "fulfilled" && phindTabsResult.value.length > 0) {
            result.phindTabs = phindTabsResult.value
        }
        if (bardTabsResult.status === "fulfilled" && bardTabsResult.value.length > 0) {
            result.bardTabs = bardTabsResult.value
        }
        if (perplexityTabsResult.status === "fulfilled" && perplexityTabsResult.value.length > 0) {
            result.perplexityTabs = perplexityTabsResult.value
        }

        return result
    });


document.addEventListener("DOMContentLoaded", () => {

    if (!browser.scripting) {
        _LL("add 'scripting' permission");
        return;
    }

    const promptTextElem = document.getElementById('text-prompt');
    if (!promptTextElem) {
        _LL("'text-prompt' elelemnt not found");
        return;
    }
    const promptButtonElem = document.getElementById("submit-prompt");
    if (!promptButtonElem) {
        _LL("'submit-prompt' elelemnt not found");
        return;
    }
    const openaiToggleElem = document.getElementById("openai-toggle");
    if (!openaiToggleElem) {
        _LL("'openai-toggle' elelemnt not found");
        return;
    }
    const phindToggleElem = document.getElementById("phind-toggle");
    if (!phindToggleElem) {
        _LL("'phind-toggle' elelemnt not found");
        return;
    }
    const bardToggleElem = document.getElementById("bard-toggle");
    if (!bardToggleElem) {
        _LL("'bard-toggle' elelemnt not found");
        return;
    }
    const perplexityToggleElem = document.getElementById("perplexity-toggle");
    if (!perplexityToggleElem) {
        _LL("'perplexity-toggle' elelemnt not found");
        return;
    }

    promptTextElem.addEventListener('input', () => {

        const value = promptTextElem.value;

        if (value.trim().length > 0) {
            // promptTextElem.value = limitCharacterInRow( value, 50 );
            promptButtonElem.disabled = false;
        }
        else {
            promptButtonElem.disabled = true;
        }

    });

    const saveSettingsHandler = () => 
        saveSettings( {
            openai: openaiToggleElem.checked,
            phind: phindToggleElem.checked,
            bard: bardToggleElem.checked,
            perplexity: perplexityToggleElem.checked,
            lastPrompt: promptTextElem.value
        })

    openaiToggleElem.addEventListener('change', saveSettingsHandler );
    phindToggleElem.addEventListener('change', saveSettingsHandler );
    bardToggleElem.addEventListener('change', saveSettingsHandler );
    perplexityToggleElem.addEventListener('change', saveSettingsHandler );

    openaiToggleElem.checked = false
    phindToggleElem.checked = false
    bardToggleElem.checked = false
    perplexityToggleElem.checked = false

    getSettings()
    .then(settings => {

            if (!settings) {
                return {
                    openai: true,
                    phind: true,
                    bard: true,
                    perplexity: true,
                    lastPrompt: ""
                }
            }
            return settings;

    })
    .then(settings => {

        promptTextElem.value = settings.lastPrompt ?? "";
        promptTextElem.dispatchEvent(new Event('input', { 'bubbles': true }));

        queryOpenedAITab().then(aiTabs => {
            
            browser.runtime.sendMessage(aiTabs)

            const { openaiTabs, phindTabs, bardTabs, perplexityTabs } = aiTabs;

            const openaiTabsExists = openaiTabs.length > 0;
            openaiToggleElem.disabled = !openaiTabsExists;
            openaiToggleElem.checked = settings.openai && openaiTabsExists;

            const phindTabsExists = phindTabs.length > 0;
            phindToggleElem.disabled = !phindTabsExists;
            phindToggleElem.checked = settings.phind && phindTabsExists;

            const bardTabsExists = bardTabs.length > 0;
            bardToggleElem.checked = settings.bard && bardTabsExists;
            bardToggleElem.disabled = !bardTabsExists;

            const perplexityTabsExists = perplexityTabs.length > 0
            perplexityToggleElem.checked = settings.perplexity && perplexityTabsExists;
            perplexityToggleElem.disabled = !perplexityTabsExists;

            promptButtonElem.addEventListener("click", async () => {

                const service = []

                if (openaiToggleElem.checked) {
                    service.push(writePrompt(openaiTabs, promptTextElem.value, openaiSubmit))
                }
                if (phindToggleElem.checked) {
                    service.push(writePrompt(phindTabs, promptTextElem.value, phindSubmit))
                }
                if (bardToggleElem.checked) {
                    service.push(writePrompt(bardTabs, promptTextElem.value, bardSubmit))
                }
                if (perplexityToggleElem.checked) {
                    service.push(writePrompt(perplexityTabs, promptTextElem.value, perplexitySubmit))
                }

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(promptTextElem.value)
                    _LL("copied to clipboard!")
                }
                else {
                    _LL("navigator.clipboard is not supported!");
                }

                Promise.allSettled(service)
                    .then( saveSettingsHandler )
                    .then( result => _LL( "stored! "))

                //            const url = "https://chat.openai.com"
                //            // browser.runtime.sendNativeMessage( { message: "click popup" });
                //            // browser.runtime.sendMessage({ openUrl: "https://chat.openai.com", target: "chatgpt" });
                //
                //            var tab = window.open(url, "chatgpt" );
                //
                //            if( tab ) {
                //                browser.runtime.sendMessage({ message: url + " loaded!" });
                //            }
                //            else {
                //                browser.runtime.sendMessage({ message: url + " failed!" });
                //            }

            });
        })
    })
});



