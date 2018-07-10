chrome.webRequest.onBeforeRequest.addListener(
function(details) {
    console.log("Website intercepted: " + details.url);
    // Redirect the lolcal request to a random loldog URL.
    // var i = Math.round(Math.random() * loldogs.length);
    return {redirectUrl: "https://www.google.com"};
    // return {cancel: true}
},
// filters
{
    urls: [
        "*://*.facebook.com/*",
        "*://*.messenger.com/*",
        "*://*.instagram.com/*",
        "*://*.twitter.com/*",
        "*://*.whatsapp.com/*",
        "*://*.youtube.com/*",
        "*://*.vimeo.com/*"
    ]
},
// extraInfoSpec
["blocking"]);