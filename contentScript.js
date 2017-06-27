'use strict';

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    removeDivs(message['classname'], message['searchTerms']);
});

function removeDivs(className, searchTerms){
    var elements = document.getElementsByClassName(className);
    for (let i = elements.length - 1; 0 <= i; i--) {
        let element = elements[i];
        let stringContent = element.textContent.toLowerCase();
        if (searchTerms.some(function (term) {
                return stringContent.includes(term);
            })) {
            element.remove();
        }
    }
}