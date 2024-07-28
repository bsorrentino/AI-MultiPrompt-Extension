
const template = (title) => {
    const tpl = document.createElement('template');

    tpl.innerHTML = `
<style>
    :host {
        display: block;
    }

    .container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        column-gap: 8px;
    }

    .toggle-switch {
        position: relative;
        width: 35px;
        height: 20px;
        display: inline-block;
    }

    .toggle-switch input[type="checkbox"] {
        display: none;
    }

    .slider {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: grey;
        border-radius: 30px;
        transition: 0.4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 15px;
        width: 15px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        border-radius: 50%;
        transition: 0.4s;
    }

    input:checked + .slider {
        background-color: #2196F3;
    }
    
    input:disabled + .slider {
        background-color: #ccc;
    }

    input:checked + .slider:before {
        transform: translateX(15px);
    }
</style>

<div class="container">
    <label class="toggle-switch">
        <input type="checkbox" id="toggle">
        <span class="slider"></span>
    </label>
     <p>${title}</p>
</div>
`;

    return tpl;
}

export const _LL = (msg) => chrome.runtime.sendMessage({ log: msg })

export class AIToggle extends HTMLElement {

    get #toggleElem() {
        return this.shadowRoot.getElementById('toggle')
    }

    // static get observedAttributes() {
    //     return ['checked'];
    // }

    // attributeChangedCallback(name, oldValue, newValue) {
    //     this.render();
    // }

    get checked() {
        return this.#toggleElem.checked
    }
    set checked(value) {
        this.#toggleElem.checked = value
    }

    get queryTabUrl() {
        return this.getAttribute('queryTabUrl')
    }

    get createTabUrl() {
        return this.getAttribute('createTabUrl')
    }

    constructor() {
        super();
        
        this.submitClosure = null;
    
        this.attachShadow({ mode: 'open' });
        //   if( !this.hasAttribute('title') ) {
        //     throw new Error('"title" attribute is required');
        //   }
        const title = this.getAttribute('title') ?? '---';

        this.shadowRoot.appendChild(template(title).content.cloneNode(true));

    }

    async queryTab() {
        if( !this.queryTabUrl ) {
            throw new Error( '"queryTabUrl" attribute is required' );
        }
        return chrome.tabs.query({ url: this.queryTabUrl , currentWindow:true});
    }

    createTab() {
        if( !this.createTabUrl ) {
            throw new Error( '"createTabUrl" attribute is required' );
        }
        return chrome.tabs.create({ url: this.createTabUrl, pinned: true })
    }

    async #submitPrompt( e ) {
        if( !this.checked) {
            return;
        }
        
        const { detail: prompt } = e
        const tabs = await this.queryTab();
        if (!tabs || tabs.length === 0) {
            _LL("no tabs found!");
            return;
        }
    
        _LL("tabsCount: " + tabs.length);
    
        const tab = tabs[0]
    
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            args: [
                prompt,
            ],
            func: this.submitClosure
        })
        .then(result => chrome.runtime.sendMessage({ result: result }))
        .catch(err => chrome.runtime.sendMessage({ result: "error " + err }));
    }

    #onChange() { 
        const tabs = this.queryTab()
        .then( tabs => {
            const tabsExists = tabs && tabs.length > 0

            if( this.checked && !tabsExists ) {
                this.createTab()
            }    
        })
        .finally(() => {
            this.dispatchEvent(new Event('change'));
//            this.dispatchEvent(new CustomEvent('change', {
//                bubbles: true,
//                composed: true,
//                detail: { checked: this.checked } 
//            }));
        })
    }

    connectedCallback() {

        this.#toggleElem.addEventListener('change', this.#onChange.bind(this) );
        this.addEventListener( 'submit', this.#submitPrompt.bind(this) );

        // this.queryTab().then( tabs => {
        //     const tabsExists = tabs && tabs.length > 0
        //     this.checked = tabsExists
        // })

    }

    disconnectedCallback() {
        this.#toggleElem.removeEventListener('change', this.#onChange.bind(this) );
        this.removeEventListener( 'submit', this.#submitPrompt.bind(this) );


    }
}

customElements.define('ai-toggle', AIToggle);