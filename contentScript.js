'use strict';

// TODO: Use port instead of one off message?
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === MSG.ERASE_OBJECT) {
        removeDivs(message['classname'], message['searchTerms']);
    }
    else if (message.name === MSG.GET_URL) {
        sendResponse({
            url: getBaseUrl()
        });
    }

});

function removeDivs(className, searchTerms) {
    var elements = document.getElementsByClassName(className);
    for (let i = elements.length - 1; 0 <= i; i--) {
        let element = elements[i];
        let stringContent = element.textContent.toLowerCase();
        if (searchTerms.some(function (term) { return stringContent.includes(term); })) {
            element.remove();
        }
    }
}

function getBaseUrl() {
    if (location.origin === 'undefined') {
        location.origin = location.protocol + '//' + location.host;
    }
    var l = findTopListItemClassName();
    return location.origin;
}

/**
 * This method finds the top level list item so 
 * users don't have inspect html to find it themselves 
 */
function findTopListItemClassName() {
    let classDictionary;
    let htmlElement = document.children[0];
    classDictionary = recursiveElementExplorer(htmlElement, 0, {});
    return filterDict(classDictionary);
}
const ELEMENT_DICT_KEYS = {
    COUNT : "COUNT",
    DEPTH : "DEPTH",
    AVG_TEXT_COUNT : "AVERAGE_TEXT_COUNT"
}
/**
 * A recursive function that fills in information in the document
 * @param {HTMLCollection} element
 * @param {Number} depth 
 * @param {Dictionary} dict
 */
function recursiveElementExplorer(element, depth, dict) {
    element.classList.forEach(function (className) {
        fillClassInformation(className, depth, element, dict);
    });
    //Explore children
    let elChildren = element.children;
    if (elChildren.length === 0) return dict; // No children!


    for (let i = 0; i < elChildren.length; i++) {
        recursiveElementExplorer(elChildren[i], depth + 1, dict);
    }
    return dict;
}

function fillClassInformation(className, depth, element, classDict) {
    // Store information about this element
    if (className in classDict) {
        // Choose deepest depth
        let curDepth = classDict[className][ELEMENT_DICT_KEYS.DEPTH];
        if (curDepth > depth) classDict[className][ELEMENT_DICT_KEYS.DEPTH] = curDepth;
        // Update average and count
        let textCount = element.textContent.length || 0;
        let avg = classDict[className][ELEMENT_DICT_KEYS.AVG_TEXT_COUNT];
        let count = classDict[className][ELEMENT_DICT_KEYS.COUNT];
        let new_avg = (avg*count + textCount)/(count + 1);
        classDict[className][ELEMENT_DICT_KEYS.AVG_TEXT_COUNT] = new_avg;
        classDict[className][ELEMENT_DICT_KEYS.COUNT] += 1;
    }
    else {
        let textCount = element.textContent.length || 0;
        classDict[className] = {
            [ELEMENT_DICT_KEYS.COUNT] : 1,
            [ELEMENT_DICT_KEYS.DEPTH] : depth,
            [ELEMENT_DICT_KEYS.AVG_TEXT_COUNT] : textCount,
            [ELEMENT_DICT_KEYS.TOTAL_TEXT_COUNT] : textCount
        }
    }
}
function filterDict(dict) {
    const FILTER_COUNT_THRESHOLD = 10;
    const FILTER_AVG_TEXT_COUNT_THRESHOLD = 100;
    for (let key in dict) {
        if (dict.hasOwnProperty(key)) {
            if (dict[key][ELEMENT_DICT_KEYS.COUNT] < FILTER_COUNT_THRESHOLD) {
                delete dict[key];
            }
            else if(dict[key][ELEMENT_DICT_KEYS.AVG_TEXT_COUNT] < FILTER_AVG_TEXT_COUNT_THRESHOLD) {
                delete dict[key];
            }
        }
    }
    return dict;
}