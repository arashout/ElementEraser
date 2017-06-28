'use strict';

function addSearchItemFromText(ul, text) {
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
    let msg = createEraseObj();
    msg.name = CONSTANTS.MSG_ERASE_OBJECT;
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) { });
}

function updateURLKey(tabs) {
    // Ask for url for content script
    let msg = {
        name: CONSTANTS.MSG_GET_URL
    }
    chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
        var inputURLElement = document.getElementById('inputURLKey');
        inputURLElement.value = response.url;

        retrieveEraseObj(response.url);
    });
}

/**
 * Given an element that contains <li> items
 * Return an array of strings for each <li> item
 */
function getArrayFromList(elementContainer) {
    var arrayLi = [];
    for (let i = 0; i < elementContainer.length; i++) {
        let li = elementContainer[i];
        arrayLi.push(li.textContent);
    }
    return arrayLi;
}

document.addEventListener("DOMContentLoaded", function () {
    var ulSearchTerms = document.getElementById('listSearchTerms');

    // Add searchTerm event listeners
    var searchTermInputElement = document.getElementById('inputSearchTerm');
    searchTermInputElement.addEventListener('input', function (e) {
        let text = this.value;
        if (text.endsWith(',')) {
            text = text.replace(/,/g, '');
            if (text.length !== 0) {
                addSearchItemFromText(ulSearchTerms, text);
                this.value = '';
            } else this.value = '';

        }
    });

    var ENTER_KEY_CODE = 13;
    var TAB_KEY_CODE = 9;
    searchTermInputElement.addEventListener('keydown', function (e) {
        if (this.value !== '' && e.keyCode == TAB_KEY_CODE) {
            addSearchItemFromText(ulSearchTerms, this.value);
            this.value = '';
        }
    });

    var query = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(query, updateURLKey);
    chrome.tabs.query(query, eraseUsingDict);

    // Add submit button event listeners
    document.getElementById('buttonDivErase').addEventListener('click', function (e) {
        chrome.tabs.query(query, eraseUsingDict);
    });

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === ENTER_KEY_CODE) {
            chrome.tabs.query(query, eraseUsingDict);
        }
    });

    document.getElementById('buttonStoreResults').addEventListener('click', function (e) {
        let currentURLKey = document.getElementById('inputURLKey').value;
        let currentEraseObj = createEraseObj();
        storeEraseObj(currentURLKey, currentEraseObj);
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

function retrieveEraseObj(urlKey) {
    chrome.storage.local.get(urlKey, function (result) {
        if(result.classname){
            prepopulateEraseFields(result);
        }
    })
}

function createEraseObj() {
    var nodeListSearchTerms = document.getElementById("listSearchTerms").getElementsByTagName("li");
    var arrSearchTerms = getArrayFromList(nodeListSearchTerms);

    return {
        searchTerms: arrSearchTerms,
        classname: document.getElementById('inputDivClass').value
    }
}

function prepopulateEraseFields(eraseObj){
    console.log(eraseObj);
    document.getElementById('inputDivClass').value = eraseObj.classname;
}