let time = .1 * 60;
let countDown;
let intervalTime = 1000;
// let redirectUrl;
let redirectUrl = 'https://auth.ultimatix.net/utxLogin/login?TYPE=33554432&REALMOID=06-45402d83-8994-41d4-9e1e-60a2815da6a3&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=-SM-EdbHMX6T%2bWb8DN7DVmL5sbY%2bn%2b30S7n%2fgIBptYa9dLbudResX4AYm9ObPeNozoDH&TARGET=-SM-HTTPS%3a%2f%2fwww%2eultimatix%2enet%2fultimatixPortalWeb%2fUTXPortalRedirect%3fTARGET%3dhttps-%3A-%2F-%2Fwww%2eultimatix%2enet-%2F';
let activeTab;

const statusColors = {
    green: '#090',
    yellow: '#fc0',
    orange: '#f60',
    red: '#c00',
    gray: '#808080'
};

const urlPatterns = [
    '*://*.facebook.com/*',
    '*://*.messenger.com/*',
    '*://*.instagram.com/*',
    '*://*.twitter.com/*',
    '*://*.whatsapp.com/*',
    '*://*.youtube.com/*',
    '*://*.vimeo.com/*'
]

const restrictedUrls = [
    'facebook.com',
    'messenger.com',
    'instagram.com',
    'twitter.com',
    'whatsapp.com',
    'youtube.com',
    'vimeo.com'
];

function showNotification(type) {
    let defaultMessage = {message: 'Have you finished your homework?'};
    chrome.storage.sync.get({savedOptions: defaultMessage}, function(data) {
        let message = data.savedOptions.message;

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Uh Oh! Web Time Limit Reached.\nWhy don\'t you rest those eyes!',
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

    if(time >= (120 * 60)){           
        // intervalTime = 3600000;
        let secToHr = (time / 60 / 60).toPrecision(2);     
        timeString = ('0000' + secToHr + 'h').slice(-4);        
        setBadge(timeString, statusColors.green);
    } else if(time >= (5 * 60)) {
        // intervalTime = 60000;
        let secToMin = Math.round(time / 60);
        timeString = ('0000' + secToMin + 'm').slice(-4);      
        setBadge(timeString, statusColors.yellow);
    } else if(time > 0){
        // intervalTime = 1000;
        timeString = ('0000' + time + 's').slice(-4);      
        setBadge(timeString, statusColors.orange);
    } else {                       
        timeString = ('0000' + time + 's').slice(-4);       
        setBadge(timeString, statusColors.red);
        if(countDown && countDown !== null){
            clearInterval(countDown);
            countDown = null; 
        }
        doBlock();
        showNotification();
    };
}

function setBadge(text, color) {
    chrome.browserAction.setBadgeText({text: text});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
}

function startTimer() {    
    console.log('Starting Timer!');
    if(time > 0 && (!countDown || countDown === null)) {
        countDown = setInterval(function() { 
            time--;
            setTimeString();
            if(time === 5 * 60) {
                alert("Five Minutes of Web Use Left!")
            }
        }, intervalTime)
    }
}

function pauseTimer() {           
    console.log('Pausing Timer');
    if((countDown && countDown !== null)) {
        clearInterval(countDown);
        countDown = null;
        chrome.browserAction.setBadgeBackgroundColor({color: statusColors.gray});
    }
}

function doBlock(currentTab) {    
    // console.log('Doing Blocking');  
    if(redirectUrl) {
        // return {redirectUrl: redirectUrl};
        if (currentTab) {
            console.log('Yes Current Tab to Block');            
            chrome.tabs.update(currentTab.id, {url: redirectUrl});
        } else {
            console.log('NO Current Tab to Block');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(tabs){
                chrome.tabs.update(tabs[0].id, {url: redirectUrl});
            }
          });        
        }
    } else {
        setTimeout(function() {
        // return {cancel: true};
            if(currentTab) {
                chrome.tabs.remove(currentTab.id);
            } else {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        activeTab = tabs[0];
                        if(activeTab) {
                            chrome.tabs.remove(activeTab.id);
                        }
                    });
            }   
        }, 1000);
    }
}

function isRestricted(urlRequest) {  
    for(let i=0; i<restrictedUrls.length; i++) {
        if (urlRequest.indexOf(restrictedUrls[i]) !== -1) {
            // console.log('Flagged Website: ' + urlRequest);
            return true;
        }
    }
    return false;
}

function getActiveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        activeTab = tabs[0];
    });
}

chrome.runtime.onInstalled.addListener(function() {
    setTimeString();
    chrome.browserAction.setBadgeBackgroundColor({color: statusColors.gray});
    // setBadge('-', statusColors.gray);
    // chrome.storage.sync.get(['timerSettings', 'restrictedUrls'], function(data) {
        // timerMinutes = data.timerSettings.minutesLeft;
    //     if (timerMinutes) {
    //         time = timerMinutes;
    //     } else {
    //         time = 0;
    //     }
    // });
});

// chrome.webRequest.onBeforeRequest.addListener(
// function(details) {    
//     if(time <= 0) {
//         console.log('In Web Request');
//         return doBlock();
//     }
// },
// // filters
// {
//     urls: urlPatterns,
//     types: ['main_frame']
// },
// // extraInfoSpec
// ['blocking']
// );

function checkActiveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        activeTab = tabs[0];
        if(activeTab) {
            // console.log('Active Tab Url' + activeTab.url)
            let tabRestricted = isRestricted(activeTab.url)
            // console.log('Is restricted: ' + tabRestricted);

            if(time > 0 && tabRestricted) {
                startTimer();
            }
            if(time <= 0 && tabRestricted) {
                doBlock(activeTab);
            } else if(!tabRestricted && countDown && countDown !== null) { 
                pauseTimer();        
            }
        }
    });
}  

chrome.tabs.onActivated.addListener(function(activeInfo) { 
    // console.log('Tab: onActivated');
    checkActiveTab();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {   
    // console.log('Tab: onUpdated');
    checkActiveTab();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if(windowId !== chrome.windows.WINDOW_ID_NONE) {
        console.log('Window: onFocusChanged');
        checkActiveTab();
    }
},
//filter
{
    windowTypes: ['normal', 'popup']
}
);

// chrome.runtime.onMessage.addListener(
//     function(message, sendResponse) {
//     console.log('Receiving Message');
//       if(message == 'redirectTab'){
//         console.log('Trying to Redirect');
//         chrome.tabs.executeScript({
//             code: 'alert(About to Change Location)'// 'location.assign("http://example.com")'
//         });
//     }
// });