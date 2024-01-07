// chrome.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//     console.log("Received response: ", response);
// });

const setTheme = ( mql ) => {
    if( mql.matches ) {
        console.log( "dark mode" )
        chrome.runtime.sendMessage({ theme: 'dark' });
    } else {
        chrome.runtime.sendMessage({ theme: 'light' });
        console.log( "light mode" )
    }
}

const mediaQueryForDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')

setTheme( mediaQueryForDarkScheme )

mediaQueryForDarkScheme.addEventListener( 'change', setTheme ) 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
});
