
// Logging
const _LL = (msg) => chrome.runtime.sendMessage({ log: msg })

/**
 * Save Settings in local sorage
 * 
 * @param {Settings} settings
 * @returns {Promise<void>}
 */
const saveSettings = (settings) =>
    chrome.storage.local.set({ settings: settings })

/**
 * get settings from local storage
 *
 * @return  {Promise<Settings|null>}  promise resolve settings or null if not found
 */
const getSettings = () =>
    chrome.storage.local.get("settings").then(results => results.settings)

document.addEventListener("DOMContentLoaded", () => {

    if (!chrome.scripting) {
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

    const toggleElements = Array.from(document.querySelectorAll(".toggle"));

    getSettings()
        .then(settings => {

            if (!settings) {
                const _settings = toggleElements.reduce((acc, elem) => {
                    acc[elem.id] = true
                    return acc
                }, { lastPrompt: "" })
                return _settings

            }
            return settings;

        })
        .then(settings => {

            promptTextElem.value = settings.lastPrompt ?? "";
            promptTextElem.dispatchEvent(new Event('input', { 'bubbles': true }));

            //chrome.runtime.sendMessage(aiTabs)

            const saveSettingsHandler = () => {
                const _settings = toggleElements.reduce((acc, elem) => {
                    acc[elem.id] = elem.checked
                    return acc
                }, { lastPrompt: promptTextElem.value })

                saveSettings(_settings)
            };


            toggleElements.forEach(elem => {

                elem.checked = settings[elem.id];

                elem.addEventListener('change', saveSettingsHandler );
            })

            promptButtonElem.addEventListener("click", async () => {

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(promptTextElem.value)
                    _LL("copied to clipboard!")
                }
                else {
                    _LL("navigator.clipboard is not supported!");
                }

                const ev = new CustomEvent('submit', { detail: promptTextElem.value })

                toggleElements.forEach(elem => elem.dispatchEvent(ev));
                saveSettingsHandler();
            })
        });

});


