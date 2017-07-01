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
});