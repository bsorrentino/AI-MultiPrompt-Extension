// browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//     console.log("Received response: ", response);
// });

const setTheme = ( mql ) => {
    if( mql.matches ) {
        console.log( "dark mode" )
        browser.runtime.sendMessage({ theme: 'dark' });
    } else {
        browser.runtime.sendMessage({ theme: 'light' });
        console.log( "light mode" )
    }
}

const mediaQueryForDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')

setTheme( mediaQueryForDarkScheme )

mediaQueryForDarkScheme.addEventListener( 'change', setTheme ) 

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
});
