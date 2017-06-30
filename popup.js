'use strict';

document.addEventListener("DOMContentLoaded", function () {
    let query = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(query, updateURLKey);

    ELEMENTS.INPUT_SEARCH_TERM.addEventListener('input', function (e) {
        let text = this.value;
        if (text.endsWith(',')) {
            text = text.replace(/,/g, '');
            if (text.length !== 0) {
                addFilterItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, text);
                this.value = '';
            } else this.value = '';

        }
    });

    ELEMENTS.INPUT_SEARCH_TERM.addEventListener('keydown', function (e) {
        if (this.value !== '' &&
            (e.keyCode === KEY_CODES.TAB || e.keyCode === KEY_CODES.ENTER)) {
            addFilterItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, this.value);
            this.value = '';
        }
    });
    ELEMENTS.BUTTON_ERASE.addEventListener('click', function (e) {
        chrome.tabs.query(query, eraseUsingDict);
    });
    ELEMENTS.BUTTON_ERASE.addEventListener('keydown', function (e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            chrome.tabs.query(query, eraseUsingDict);
        }
    })

    ELEMENTS.BUTTON_STORE.addEventListener('click', function (e) {
        let currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
        let currentEraseObj = createEraseObj();
        storeEraseObj(currentURLKey, currentEraseObj);
    });
    ELEMENTS.BUTTON_STORE.addEventListener('keydown', function (e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            let currentURLKey = ELEMENTS.INPUT_URL_KEY.value;
            let currentEraseObj = createEraseObj();
            storeEraseObj(currentURLKey, currentEraseObj);
        }
    });

    ELEMENTS.BUTTON_RETRIEVE.addEventListener('click', function (e) {
        retrieveEraseObjContainer(ELEMENTS.INPUT_URL_KEY.value);
    });
    ELEMENTS.BUTTON_RETRIEVE.addEventListener('keydown', function (e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            retrieveEraseObjContainer(ELEMENTS.INPUT_URL_KEY.value);
        }
    });

    function predictHandler(e) {
        if (e.keyCode === KEY_CODES.ENTER) {
            const msg = {
                name: MSG.PREDICT_CLASS
            }
            chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
                if (response !== undefined) {
                    ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = response.predictedClass;
                }
            });
        }
    }
    ELEMENTS.BUTTON_PREDICT.addEventListener('click', function (e) {
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (response !== undefined) {
                ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = response.predictedClass;
            }
        });
    });

    ['keydown', 'click'].forEach(function (event) {
        ELEMENTS.BUTTON_PREDICT.addEventListener(event, predictHandler);
    });
});
function storeEraseObj(urlKey, eraseObj) {
    if (urlKey) {
        let saveObj = {};
        saveObj[urlKey] = eraseObj;
        chrome.storage.local.set(saveObj, function () {
            if (chrome.extension.lastError) {
                alert('An error occurred: ' + chrome.extension.lastError.message);
            }
        });
    }
    else return false;

    return true;
}

function retrieveEraseObjContainer(urlKey) {
    chrome.storage.local.get(urlKey, function (result) {
        // TODO: I shouldn't have to do this! Figure out what's going on
        const urlKey = ELEMENTS.INPUT_URL_KEY.value;
        const eraseObj = result[urlKey];
        if (eraseObj !== null) {
            prepopulateEraseFields(eraseObj);
        }
        else{
            // TODO: Retrieve error
        }
    });
}

function createEraseObj() {
    const nodeListFilterTerms = ELEMENTS.UNORDERED_LIST_SEARCH_TERMS.getElementsByTagName("li");
    const arrFilterTerms = getArrayFromList(nodeListFilterTerms);

    return {
        filterTerms: arrFilterTerms,
        classname: ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value
    }
}

function prepopulateEraseFields(eraseObj) {
    const arrFilterTerms = eraseObj.filterTerms;
    for (let i = 0; i < arrFilterTerms.length; i++) {
        addFilterItemFromText(ELEMENTS.UNORDERED_LIST_SEARCH_TERMS, arrFilterTerms[i]);
    }
    ELEMENTS.INPUT_CONTAINER_CLASS_NAME.value = eraseObj.classname;
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

function eraseUsingDict(tabs) {
    const msg = createEraseObj();
    msg.name = MSG.ERASE_OBJECT;
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
}

function updateURLKey(tabs) {
    // Ask for url for content script
    const msg = {
        name: MSG.GET_URL
    }
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
        if (response !== undefined) {
            ELEMENTS.INPUT_URL_KEY.value = response.url;
        }
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