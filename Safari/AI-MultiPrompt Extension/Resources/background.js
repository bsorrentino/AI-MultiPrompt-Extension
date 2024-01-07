chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);

    if( request.theme === 'dark') {
        // chrome.action.setIcon({ path: 'images/toolbar-icon-72.png' });
        chrome.action.setIcon({ path: 'images/toolbar-icon-72.png' });
    }
    else if( request.theme === 'light') {
        chrome.action.setIcon({ path: 'images/toolbar-icon-72-light.png' });
    }
    // else if (request.greeting === "hello") {
    //     sendResponse({ farewell: "goodbye" });
    // }

});
