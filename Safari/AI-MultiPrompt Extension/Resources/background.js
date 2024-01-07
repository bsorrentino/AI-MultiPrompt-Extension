browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);

    if( request.theme === 'dark') {
        // browser.action.setIcon({ path: 'images/toolbar-icon-72.png' });
        browser.action.setIcon({ path: 'images/toolbar-icon-72.png' });
    }
    else if( request.theme === 'light') {
        browser.action.setIcon({ path: 'images/toolbar-icon-72-light.png' });
    }
    // else if (request.greeting === "hello") {
    //     sendResponse({ farewell: "goodbye" });
    // }

});
