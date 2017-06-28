'use strict';

// TODO: Use port instead of one off message?
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === CONSTANTS.MSG_POPUP_DICT) {
        removeDivs(message['classname'], message['searchTerms']);
    }
    else if (message.name === CONSTANTS.MSG_GET_URL) {
        sendResponse({
            url : getBaseUrl()
        });
    }

});

function removeDivs(className, searchTerms) {
    var elements = document.getElementsByClassName(className);
    for (let i = elements.length - 1; 0 <= i; i--) {
        let element = elements[i];
        let stringContent = element.textContent.toLowerCase();
        if (searchTerms.some(function (term) {return stringContent.includes(term);}))
        {
            element.remove();
        }
    }
}

function getBaseUrl() {
    if (location.origin === 'undefined') {
        location.origin = location.protocol + '//' + location.host;
    }
    return location.origin;
}