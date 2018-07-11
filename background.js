let url
let time = 5;
let counter;
let redirect_url;
const badge_colors = {
    green: "#0C0",
    yellow: "#FC3",
    red: "#C00",
    gray: "#808080"
}
const url_patterns = [
    "*://*.facebook.com/*",
    "*://*.messenger.com/*",
    "*://*.instagram.com/*",
    "*://*.twitter.com/*",
    "*://*.whatsapp.com/*",
    "*://*.youtube.com/*",
    "*://*.vimeo.com/*"
]

function startTimer() {    
    counter = setInterval(function() {   
        if(time > 0) {
            time--;
            chrome.browserAction.setBadgeText({text: getTimeString()});
            if(time == 0) {                
                chrome.browserAction.setBadgeBackgroundColor({color: badge_colors.red});
            }
        } else {     
            if(counter){
                clearInterval(counter);   
            }
        }   
    }, 1000)
}

function getTimeString() {
    return ("0000" + time).slice(-4);
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.browserAction.setBadgeText({text: "-"});
    chrome.browserAction.setBadgeBackgroundColor({color: badge_colors.gray});
});

chrome.webRequest.onBeforeRequest.addListener(
function(details) { 
    url = details.url;
    console.log("Flagged Website: " + url);

    chrome.browserAction.setBadgeText({text: getTimeString()});

    if(time > 0) {
        chrome.browserAction.setBadgeBackgroundColor({color: badge_colors.green});
        if(!counter){
        startTimer();   
        }   
    }    
    
    if(time <= 0) {        
        if (typeof redirect_url !== "undefined") {
            return {redirectUrl: redirect_url};
        } else {
            return {cancel: true}
        }
    }
},
// filters
{
    urls: url_patterns
},
// extraInfoSpec
["blocking"]
);