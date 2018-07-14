let url
let time = .1 * 60;
let countDown;
let intervalTime = 1000;
let redirectUrl = 'https://www.google.com';

const statusColors = {
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

function showNotification() {
    let defaultMessage = {message: 'Have you finished your homework?'};
    chrome.storage.sync.get({savedOptions: defaultMessage}, function(data) {
        let message = data.savedOptions.message;

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Uh Oh! Web Time Limit Reached.\nHave a good rest of the day!',
            message: message,
            buttons: [
                {title: 'OK'}
            ],
            priority: 2
        }, function(notificationId) {
            chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
                chrome.notifications.clear(notificationId);
            });
        });
    });
}

function setTimeString() {
    let timeString;

    if(time > (999 * 60)){           
        // intervalTime = 3600000;
        let secToHr = (time / 60 / 60).toPrecision(2);     
        timeString = ('0000' + secToHr + 'h').slice(-4);        
        setBadge(timeString, statusColors.green);
    } else if(time >= (5 * 60)) {
        // intervalTime = 60000;
        let secToMin = Math.round(time / 60);
        timeString = ('0000' + secToMin + 'm').slice(-4);      
        setBadge(timeString, statusColors.green);
    } else if(time > 0){
        // intervalTime = 1000;
        timeString = ('0000' + time + 's').slice(-4);      
        setBadge(timeString, statusColors.yellow);
    } else {                       
        timeString = ('000s');       
        setBadge(timeString, statusColors.red);
        if(countDown && countDown !== null){
            console.log('Clear Timer');
            clearInterval(countDown);
            countDown = null; 
        }
        showNotification();
    };
}

function setBadge(text, color) {
    chrome.browserAction.setBadgeText({text: text});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
}

function startTimer() {    
    countDown = setInterval(function() { 
        time--;
        setTimeString();
    }, intervalTime)
}

function doBlock() {        
    if(redirectUrl) {
        return {redirectUrl: redirectUrl};
    } else {
        return {cancel: true};
    }
}

function pauseTimer() {
    if(!siteBlocked) {
        clearInterval(countDown);
        countDown = null
        chrome.browserAction.setBadgeBackgroundColor({color: statusColors.gray});
    }
}

chrome.runtime.onInstalled.addListener(function() {
    setBadge('-', statusColors.gray);
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
    let siteBlocked = false;
    url = details.url;    
    console.log('Website Requested: ' + url);
       
    url_bases.forEach(function(blockedUrl) {
        if (url.indexOf(blockedUrl) !== -1) {
            console.log('Flagged: ' + url);
            siteBlocked = true;
            if((!countDown || countDown === null) && time !== 0){
                console.log('Starting Timer!')
                startTimer();
            }
        }
    });
    
    if (time <= 0 && siteBlocked) {
        return doBlock();
     } else if(siteBlocked) {
        
     } else {
        if((countDown && countDown !== null)) {            
            console.log('Pausing Timer');
            pauseTimer();
        }
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