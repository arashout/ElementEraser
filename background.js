let state = STATE.OFF;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === MSG.TOGGLE_STATE) {
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
        sendResponse({ 'currentState': state });
    }
    else if (message.name === MSG.GET_STATE) {
        sendResponse({ 'currentState': state });
    }
});