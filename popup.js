'use strict';

document.addEventListener("DOMContentLoaded", function () {
    function updateURLKey(tabs) {
        // Ask for url for content script
        let msg = {
            [MSG_KEYS.NAME]: MSG.GET_URL
        }
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (response !== undefined) {
                ELEMENTS.INPUT_URL_KEY.value = response.url;
            }
        });
    }
    chrome.tabs.query(ACTIVE_TAB_QUERY, updateURLKey);

    function inputFilterTermHandler(e) {
        let inputElement = ELEMENTS.INPUT_FILTER_TERM;
        let text = inputElement.value;
        if (text === '') return;
        if (e.keyCode === KEY_CODES.ENTER || e.keyCode === KEY_CODES.TAB) {
            addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, text);
            inputElement.value = '';
        }
        else if (e.type === EVENTS.INPUT) {
            if (text.endsWith(',')) {
                text = text.replace(/,/g, '');
                if (text.length !== 0) {
                    addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, text);
                    inputElement.value = '';
                } else inputElement.value = ''; // User enters "," without anything else
            }
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.INPUT].forEach(function (event) {
        ELEMENTS.INPUT_FILTER_TERM.addEventListener(event, function (e) { inputFilterTermHandler(e) });
    });

    function eraseUsingDict(tabs) {
        let msg = {
            [MSG_KEYS.NAME]: MSG.ERASE_OBJECT,
            [MSG_KEYS.ERASE_OBJECT]: createEraseObj()
        }
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
    }
    function eraseHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            chrome.tabs.query(ACTIVE_TAB_QUERY, eraseUsingDict);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_ERASE.addEventListener(event, function (e) { eraseHandler(e) });
    });

    function storeHandler(e) {
        let currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
        let currentEraseObj = createEraseObj();
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            storeEraseObj(currentURLKey, currentEraseObj);
        }

    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_STORE.addEventListener(event, function (e) { storeHandler(e) });
    });

    function retrieveHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            retrieveEraseObjContainer(ELEMENTS.INPUT_URL_KEY.value);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_RETRIEVE.addEventListener(event, function (e) { retrieveHandler(e) });
    });

    function predictClassQuery(tabs) {
        let msg = {
            [MSG_KEYS.NAME]: MSG.PREDICT_CLASS
        }
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (response !== undefined) {
                ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = response[RESPONSE_KEYS.PREDICTED_CLASSES];
            }
        });
    }
    function predictHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER || e.type === EVENTS.CLICK) {
            chrome.tabs.query(ACTIVE_TAB_QUERY, predictClassQuery);
        }
    }
    [EVENTS.KEY_DOWN, EVENTS.CLICK].forEach(function (event) {
        ELEMENTS.BUTTON_PREDICT.addEventListener(event, function (e) { predictHandler(e); });
    });

    // On start up ask background script what the current state should be
    function updateToggle() {
        let msg = {
            [MSG_KEYS.NAME]: MSG.GET_STATE
        }
        chrome.runtime.sendMessage(msg, function (response) {
            ELEMENTS.TOGGLE_STATE.checked = response[RESPONSE_KEYS.CURRENT_STATE];
        });
    }
    updateToggle();
    ELEMENTS.TOGGLE_STATE.addEventListener('change', function (e) {
        let msg = {
            [MSG_KEYS.NAME]: MSG.TOGGLE_STATE
        }
        chrome.runtime.sendMessage(msg, function (response) {
            console.log(response[RESPONSE_KEYS.CURRENT_STATE]);
        });
    });
});

function storeEraseObj(urlKey, eraseObj) {
    if (urlKey) {
        let saveObj = {};
        saveObj[urlKey] = eraseObj;
        chrome.storage.sync.set(saveObj, function () {
            if (chrome.extension.lastError) {
                alert('An error occurred: ' + chrome.extension.lastError.message);
            }
        });
    }
    else return false;

    return true;
}

function retrieveEraseObjContainer(urlKey) {
    chrome.storage.sync.get(urlKey, function (result) {
        // TODO: I shouldn't have to do this! Figure out what's going on
        let urlKey = ELEMENTS.INPUT_URL_KEY.value;
        let eraseObj = result[urlKey];
        if (eraseObj !== null) {
            prepopulateEraseFields(eraseObj);
        }
        else {
            // TODO: Retrieve error
        }
    });
}

function createEraseObj() {
    const nodeListFilterTerms = ELEMENTS.UNORDERED_LIST_FILTER_TERMS.getElementsByTagName("li");
    const arrFilterTerms = getArrayFromList(nodeListFilterTerms);

    return {
        [ERASE_KEYS.FILTER_TERMS]: arrFilterTerms,
        [ERASE_KEYS.CLASS_NAMES]: ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value
    }
}

function prepopulateEraseFields(eraseObj) {
    if (eraseObj) {
        const arrFilterTerms = eraseObj[ERASE_KEYS.FILTER_TERMS];
        for (let i = 0; i < arrFilterTerms.length; i++) {
            addFilterItemFromText(ELEMENTS.UNORDERED_LIST_FILTER_TERMS, arrFilterTerms[i]);
        }
        ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = eraseObj[ERASE_KEYS.CLASS_NAMES];
    }
}

function addFilterItemFromText(ul, text) {
    // First check if term already exists in UL
    if (ul.outerText.split('\n').includes(text)) {
        return;
    }

    let li = document.createElement('li');
    li.classList.add('searchTerm');
    li.classList.add('block');
    li.tabIndex = -1;

    let span = document.createElement('span');
    span.classList.add('tag');
    span.classList.add('is-success');
    span.appendChild(document.createTextNode(text));

    let buttonDelete = document.createElement('button');
    buttonDelete.classList.add('delete');
    buttonDelete.classList.add('is-small');

    span.appendChild(buttonDelete);

    li.appendChild(span);

    ul.appendChild(li);

    // Add event listener to delete on click
    buttonDelete.addEventListener("click", function (e) {
        ul.removeChild(li);
    });
}

/**
 * Given an element that contains <li> items
 * Return an array of strings for each <li> item
 */
function getArrayFromList(elementContainer) {
    let arrayLi = [];
    for (let i = 0; i < elementContainer.length; i++) {
        let li = elementContainer[i];
        arrayLi.push(li.textContent);
    }
    return arrayLi;
}