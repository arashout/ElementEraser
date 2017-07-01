let state = STATE.OFF;

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
    else if (message[MSG_KEYS.NAME] === MSG.CHANGES_DETECTED) {
        if (state === STATE.ON) {
            const urlKey = message[MSG_KEYS.CURRENT_URL];
            chrome.storage.sync.get(urlKey, function (result) {
                if (chrome.extension.lastError) {
                    alert('An error occurred: ' + chrome.extension.lastError.message);
                }
                else {
                    const eraseObj = result[urlKey];
                    if (eraseObj !== null) {
                        const msg = {
                            [MSG_KEYS.NAME]: MSG.ERASE_OBJECT,
                            [MSG_KEYS.ERASE_OBJECT]: eraseObj
                        }
                        chrome.runtime.sendMessage(msg, function (response) {
                            console.log(response);
                        });
                    }
                    else {}
                }
            });
        }
    }
});