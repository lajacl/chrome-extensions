const defaultOptions = {
    blockMode: 'timer',
    timeLength: '2',
    timeUnit: 'hour',
    timePeriod: 'day',
    blockMethod: 'close',
    redirectUrl: 'https://www.google.com',
    message: 'Have you finished your homework?'     
};   

const defaultTimer = getTimerSettings(defaultOptions.timeLength, defaultOptions.timeUnit, defaultOptions.timePeriod);

function updateStatus(message) {
    let status = document.getElementById('status');
    status.textContent = message;
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
}

function site(groupName, alias, blocked) {
    name = groupName,
    value = alias,
    url,
    urlPattern,
    isBlocked = blocked
}

function getTimerSettings (timeLength, timeUnit, timePeriod) {
    let timerMinutes = timeLength;
    let timerDateStart = new Date();
    let timerDateReset = new Date(timerDateStart);
    let daysToAdd = 0;

    if(timeUnit === 'hour') {
        //convert to minutes
        timerMinutes *= 60;
    }

    switch (timePeriod) {
        case 'day':
            daysToAdd = 1
            break;
        case 'week':
            daysToAdd = 7
            break;
        case 'month':
            daysToAdd = 30
            break;

        default:
            break;
    };
    
    timerDateReset = new Date(timerDateReset.setTime( timerDateReset.getTime() + daysToAdd * 86400000 ));

    let timerSettings = {
        minutesLeft: timerMinutes,
        dateStart: timerDateStart,
        dateReset: timerDateReset
    };

    return timerSettings;
}

function addSite(newSite) {
    console.log('<Adding a New Website>');
}

function addMessage(blockedMessage) {      
    console.log('<Adding a New Message>');
    // let newSite = document.getElementById('new-site').value;
}

function updateWebSites (siteBoxes) {
    chrome.storage.sync.get()
    newSites = [];
    let i;

    for (i = 0; i < siteBoxes.length; i++) {
        let wesite = siteBoxes[i];
        if (wesite.type === 'checkbox') {
            let newSite = new site(website, website.value, wesite.checked);     
        
        newSites.push(newWesite);
        }
    }
    return
}

function getNewOptions() {
    return newOptions;
}

// Saves options to chrome.storage
function saveOptions() {  
    console.log('<Inside saveOptions func!>')
    let blockMode = document.querySelector('input[name="block-mode"]:checked').value;
    let timeLength = document.getElementById('time-length').value;
    let timeUnitSelector = document.getElementById('time-unit');
    let timeUnit = timeUnitSelector.options[timeUnitSelector.selectedIndex].value;
    let timePeriodSelector = document.getElementById('time-period');
    let timePeriod = timePeriodSelector.options[timePeriodSelector.selectedIndex].value;
    // let siteBoxes = document.getElementsByName('wesite');
    let blockMethod = document.querySelector('input[name="block-method"]:checked').value;
    let redirectUrl = document.getElementById('redirect-url').value;
    let newMessage = document.getElementById('new-message').value;

    console.log('Block Mode: ' + blockMode);
    console.log('Time Length: ' + timeLength);
    console.log('Time Unit: ' + timeUnit);
    console.log('Time Period: ' + timePeriod);
    console.log('Block Method: ' + blockMethod);

    let newOptions = {
        blockMode: blockMode,
        timeLength: timeLength,
        timeUnit: timeUnit,
        timePeriod: timePeriod,
        blockMethod: blockMethod,
        redirectUrl: redirectUrl,
        message: newMessage     
    };    

    let newTimer = getTimerSettings(timeLength, timeUnit, timePeriod);

    console.log(JSON.stringify(newTimer));
    console.log('New Options: ' + JSON.stringify(newOptions));    
    document.getElementById('status').textContent = 'Options saved.';

    chrome.storage.sync.set({
        savedOptions: newOptions,
        // websites:  updateWebsites(),
        timerSettings: newTimer
    }, function() {

        if(chrome.runtime.lastError) {
            updateStatus('Unable to save options at this time.')
        } else {
            // Update status to let user know options were saved.
            updateStatus('Options saved.')
        }
      });
}
  
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        savedOptions: defaultOptions
    }, function(data) {
        savedOptions = data.savedOptions;
        // timerSettings: defaultTimer
        // savedSites = data.savedSites;

        console.log('Saved Options: ' + JSON.stringify(savedOptions));

        if(Object.keys(savedOptions).length !== 0 ) {
            console.log('Saved Options NOT Empty')

            document.querySelector("input[name='block-mode'][value=" + savedOptions.blockMode + "]").checked = true;
            document.getElementById('time-length').value = savedOptions.timeLength;
            document.querySelector("select[id='time-unit'] option[value=" + savedOptions.timeUnit + "]").selected = true;
            document.querySelector("select[id='time-period'] option[value=" + savedOptions.timePeriod + "]").selected = true;        
            document.querySelector("input[name='block-method'][value=" + savedOptions.blockMethod + "]").checked = true;
            document.getElementById('redirect-url').value = savedOptions.redirectUrl;        
            document.getElementById('new-message').value = savedOptions.message;
        }
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-btn').addEventListener('click', saveOptions);
document.getElementById('new-site-btn').addEventListener('click', addSite);
document.getElementById('new-message-btn').addEventListener('click', addMessage);