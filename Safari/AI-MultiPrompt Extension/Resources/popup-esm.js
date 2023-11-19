
import { submit as copilotSubmit, queryTab as copilotQueryTab } from "./ai-chat-modules/copilot.js";
import { submit as openaiSubmit, queryTab as openaiQueryTab } from "./ai-chat-modules/chatgpt.js";
import { submit as bardSubmit, queryTab as bardQueryTab } from "./ai-chat-modules/bard.js";
import { submit as phindSubmit, queryTab as phindQueryTab } from "./ai-chat-modules/phind.js";
import { submit as perplexitySubmit, queryTab as perplexityQueryTab } from "./ai-chat-modules/perplexity.js";


console.log( "copilotQueryTab", copilotQueryTab )

// Logging
const _LL = (msg) => {
    browser.runtime.sendMessage({ log: msg })
}

/**
* Writes a prompt to the active tab's document.
*
* @param {Array<browser.tabs.Tab>} tabs - Array of browser.tabs.
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
 * Settings object to store extension preferences.
 * 
 * @typedef {Object} Settings
 * 
 * @property {boolean} openai - Whether OpenAI integration is enabled.
 * @property {boolean} phind - Whether Anthropic PHind integration is enabled. 
 * @property {boolean} bard - Whether Google Bard integration is enabled.
 * @property {boolean} perplexity - Whether Perplexity AI integration is enabled.
 * @property {boolean} copilot - Whether Copilot AI integration is enabled.
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
 * @property {Array<browser.tabs.Tab>} copilotTabs -
 */

/**
* Calls the browser.tabs.query method to get the current tabs.
*
* The query filters for tabs that have the specified url and are active.
*
* @returns {Promise<Array<PromiseSettledResult<browser.tabs.Tab>>>} A promise resolving to the matched tabs.
*/
const _queryAITabs = () => Promise.allSettled([
    openaiQueryTab(),
    phindQueryTab(),
    bardQueryTab(),
    perplexityQueryTab(),
    copilotQueryTab()
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
            copilotTabs: []
        }

        const [
            openaiTabsResult,
            phindTabsResult,
            bardTabsResult,
            perplexityTabsResult,
            copilotTabsResult
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
        if (copilotTabsResult.status === "fulfilled" && copilotTabsResult.value.length > 0) {
            result.copilotTabs = copilotTabsResult.value
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
        _LL("'text-prompt' element not found");
        return;
    }
    const promptButtonElem = document.getElementById("submit-prompt");
    if (!promptButtonElem) {
        _LL("'submit-prompt' element not found");
        return;
    }
    const openaiToggleElem = document.getElementById("openai-toggle");
    if (!openaiToggleElem) {
        _LL("'openai-toggle' element not found");
        return;
    }
    const phindToggleElem = document.getElementById("phind-toggle");
    if (!phindToggleElem) {
        _LL("'phind-toggle' element not found");
        return;
    }
    const bardToggleElem = document.getElementById("bard-toggle");
    if (!bardToggleElem) {
        _LL("'bard-toggle' element not found");
        return;
    }
    const perplexityToggleElem = document.getElementById("perplexity-toggle");
    if (!perplexityToggleElem) {
        _LL("'perplexity-toggle' element not found");
        return;
    }
    const copilotToggleElem = document.getElementById("copilot-toggle");
    if (!copilotToggleElem) {
        _LL("'copilot-toggle' element not found");
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
            copilot: copilotToggleElem.checked,
            lastPrompt: promptTextElem.value
        })

    openaiToggleElem.addEventListener('change', saveSettingsHandler );
    phindToggleElem.addEventListener('change', saveSettingsHandler );
    bardToggleElem.addEventListener('change', saveSettingsHandler );
    perplexityToggleElem.addEventListener('change', saveSettingsHandler );
    copilotToggleElem.addEventListener('change', saveSettingsHandler );

    openaiToggleElem.checked = false
    phindToggleElem.checked = false
    bardToggleElem.checked = false
    perplexityToggleElem.checked = false
    copilotToggleElem.checked = false

    getSettings()
    .then(settings => {

            if (!settings) {
                return {
                    openai: true,
                    phind: true,
                    bard: true,
                    perplexity: true,
                    copilot: true,
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

            const { 
                openaiTabs, 
                phindTabs, 
                bardTabs, 
                perplexityTabs, 
                copilotTabs 
            } = aiTabs;

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

            const copilotTabsExists = copilotTabs.length > 0
            copilotToggleElem.checked = settings.copilot && copilotTabsExists;
            copilotToggleElem.disabled = !copilotTabsExists;

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
                if (copilotToggleElem.checked) {
                    service.push(writePrompt(copilotTabs, promptTextElem.value, copilotSubmit))
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



