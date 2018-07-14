let url
let time = 6 * 60;
let countDown;
let intervalTime = 1000;
let redirectUrl = 'https://www.google.com';
let siteBlocked;

const badge_colors = {
    green: '#0C0',
    yellow: '#FC3',
    red: '#C00',
    gray: '#808080'
}

// const url_patterns = [
//     '*://*.facebook.com/*',
//     '*://*.messenger.com/*',
//     '*://*.instagram.com/*',
//     '*://*.twitter.com/*',
//     '*://*.whatsapp.com/*',
//     '*://*.youtube.com/*',
//     '*://*.vimeo.com/*'
// ]

let url_bases = [
    'facebook.com',
    'messenger.com',
    'instagram.com',
    'twitter.com',
    'whatsapp.com',
    'youtube.com',
    'vimeo.com'
]

function setTimeString() {
    let timeString;

    if(time > (999 * 60)){           
        // intervalTime = 3600000;
        let secToHr = (time / 60 / 60).toPrecision(2);     
        timeString = ('0000' + secToHr + 'h').slice(-4);        
        setBadge(timeString, badge_colors.green);
    } else if(time >= (5 * 60)) {
        // intervalTime = 60000;
        let secToMin = Math.round(time / 60)
        timeString = ('0000' + secToMin + 'm').slice(-4);      
        setBadge(timeString, badge_colors.green);
    } else {
        // intervalTime = 1000;
        timeString = ('0000' + time + 's').slice(-4);      
        setBadge(timeString, badge_colors.yellow);
    };
}

function setBadge(text, color) {
    chrome.browserAction.setBadgeText({text: text});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
}

function startTimer() {    
    countDown = setInterval(function() {   
        if(time > 0) {
            console.log('Current time: ' + time);
            time--;
            setTimeString();
            if(time == 0) {                
                chrome.browserAction.setBadgeBackgroundColor({color: badge_colors.red});
            }
        } else {     
            if(countDown){
                clearInterval(countDown);
                countDown = null; 
            }
        }   
    }, intervalTime)
}

function doBlock() {        
    if(typeof redirectUrl !== 'undefined') {
        return {redirectUrl: redirectUrl};
    } else {
        return {cancel: true};
    }
}

function stopTimer() { 
    if(!siteBlocked) {
        clearInterval(countDown);
        countDown = null
        chrome.browserAction.setBadgeBackgroundColor({color: badge_colors.gray});
    }
}

chrome.runtime.onInstalled.addListener(function() {
    setBadge('-', badge_colors.gray);
    // chrome.storage.sync.get('time', function(data) {
        // timerMinutes = data.timerSettings.minutesLeft;
    //     if (minutes != null) {
    //         chrome.browserAction.setBadgeText({text: data.time + 'm'});
    //     } else {
    //         chrome.browserAction.setBadgeText({text: '0m'});
    //     }
    // });
});

chrome.webRequest.onBeforeRequest.addListener(
function(details) { 
    url = details.url;    
    console.log('Website Requested: ' + url);
    siteBlocked = false;
       
    url_bases.forEach(function(blockedUrl) {
        if (url.indexOf(blockedUrl) !== -1) {
            console.log('Flagged: ' + url);
            siteBlocked = true;
            console.log('countDown: ' + countDown);
            if(!countDown || countDown === null){
                console.log('Starting Timer!')
                startTimer();
            }
        }
    });
    
    if (time <= 0 && siteBlocked) {
        doBlock();
     } else if(siteBlocked) {
        
     } else {
        stopTimer()
     }
},
// filters
{
    // urls: url_patterns
    urls: ['<all_urls>'],
    types: ['main_frame']
},
// extraInfoSpec
['blocking']
);