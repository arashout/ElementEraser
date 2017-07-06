var state = STATE.OFF;

var currentTab;
var currentURLKey;
var currentEraseObject;

function updateTab(tabs) {
    currentTab = tabs[0];
}
function updateEraseObject(urlKey){
    chrome.storage.sync.get(urlKey, function (result){
        if(chrome.extension.lastError){
            console.log('An error occurred: ' + chrome.extension.lastError.message);
        }
        else currentEraseObject = result[urlKey];
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message[MSG_KEYS.NAME] === MSG.TOGGLE_STATE) {
        switch (state) {
            case STATE.OFF:
                state = STATE.ON;
                break;
            case STATE.ON:
                state = STATE.OFF;
                break;
            default:
                state = STATE.OFF;
        }
        sendResponse({ [RESPONSE_KEYS.CURRENT_STATE]: state });
    }
    else if (message[MSG_KEYS.NAME] === MSG.GET_STATE) {
        sendResponse({ [RESPONSE_KEYS.CURRENT_STATE]: state });
    }
    else if (message[MSG_KEYS.NAME] === MSG.DOM_LOADED) {
        currentURLKey = message[MSG_KEYS.CURRENT_URL];
        if (state === STATE.ON) {
            chrome.storage.sync.get(urlKey, function (result) {
                if (chrome.extension.lastError) {
                    console.log('An error occurred: ' + chrome.extension.lastError.message);
                }
                else {
                    currentEraseObject = result[urlKey];
                }
            });
        }
        sendResponse({
            [RESPONSE_KEYS.CURRENT_STATE]: state,
            [RESPONSE_KEYS.SUCCESS]: true
        });
    }
});

// Periodic checker for erasing divs!
function eraseDivsMessage() {
    if(!currentTab || !currentEraseObject){
        chrome.tabs.query(ACTIVE_TAB_QUERY, updateTab);
        updateEraseObject(currentURLKey);
    }
    
    // Coercion to falsy values here
    if (state === STATE.ON && currentEraseObject && currentTab) {
        let msg = {
            [MSG_KEYS.NAME]: MSG.ERASE_OBJECT,
            [MSG_KEYS.ERASE_OBJECT]: currentEraseObject
        }
        console.log("sent erase request");
        chrome.tabs.sendMessage(currentTab.id, msg, function (response) { });
    }
}

var interval = setInterval(eraseDivsMessage, TIMERS.ERASE_DIVS);