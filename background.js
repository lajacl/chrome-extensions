let time = .2 * 60;
let countDown;
let intervalTime = 1000;
let restrictedUrls;
// let redirectUrl;
let defaultUrl = 'https://www.khanacademy.org';
let activeTab;

const statusColors = {
    green: '#090',
    yellow: '#fc0',
    orange: '#f60',
    red: '#c00',
    gray: '#808080'
};

const defaultUrls = [
    {url: 'facebook.com', blocked: false},
    {url: 'messenger.com', blocked: false},
    {url: 'instagram.com', blocked: false},
    {url: 'twitter.com', blocked: false},
    {url: 'whatsapp.com', blocked: false},
    {url: 'youtube.com', blocked: false},
    {url: 'vimeo.com', blocked: false},
    {url: 'battle.net', blocked: false},
    {url: 'epicgames.com', blocked: false},
    {url: 'leagueoflegends.com', blocked: false}
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
    if(!countDown || countDown === null) {
        countDown = setInterval(function() { 
            time--;
            setTimeString();
            if(time === 5 * 60) {
                alert("5 Minutes Left!")
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

function redirectTab(redirectUrl, currentTab) {
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
}

function closeTab() {
    setTimeout(function() {
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
    }, 1000);}

function doBlock(currentTab) {    
    console.log('Doing Blocking');
    chrome.storage.sync.get({redirectUrl: defaultUrl}, function(data) {
        let redirectUrl = data.redirectUrl;
        if(redirectUrl) {
            redirectTab(redirectUrl, currentTab);
        } else {
            closeTab(currentTab);
        }
    })  
}

function isRestricted(urlRequest) {  
    // for(let i=0; i<restrictedUrls.length; i++) {
    for(let restrictedUrl of restrictedUrls) {
        if (urlRequest.toLowerCase().indexOf(restrictedUrl.url) !== -1) {
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
    chrome.storage.sync.get({
        timerSettings: {timerMinutes: .1},
        restrictedUrls: defaultUrls
    }, function(data) {
        restrictedUrls = data.restrictedUrls; 
        timerSettings = data.timerSettings;    

        if(timerSettings && timerSettings.timerMinutes)  {
            time = timerSettings.timerMinutes * 60;
            setTimeString();
            chrome.browserAction.setBadgeBackgroundColor({color: statusColors.gray});
        }  else {            
        time = -1;
        setBadge('-', statusColors.gray);
        }
    });
});

chrome.runtime.onStartup.addListener(function() {
    console.log('onStartup Called');
    chrome.storage.sync.get({
        timerSettings: {timerMinutes: .1},
        restrictedUrls: defaultUrls
    }, function(data) {
        restrictedUrls = data.restrictedUrls; 
        timerSettings = data.timerSettings;    

        if(timerSettings && timerSettings.timerMinutes)  {
            time = timerSettings.timerMinutes * 60;
            setTimeString();
            chrome.browserAction.setBadgeBackgroundColor({color: statusColors.gray});
        }  else {            
        time = -1;
        setBadge('-', statusColors.gray);
        }
    });
});

function checkActiveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        activeTab = tabs[0];
        if(activeTab) {
            // console.log('Active Tab Url' + activeTab.url)
            let tabRestricted = isRestricted(activeTab.url)
            // console.log('Is restricted: ' + tabRestricted);

            if(time > 0 && tabRestricted) {
                startTimer();
            } else if(time === 0 && tabRestricted) {
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