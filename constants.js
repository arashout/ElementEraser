'use strict';
const CONSTANTS = {
    MSG_ERASE_OBJECT : 'MSG_ERASE_OBJECT',
    MSG_GET_URL : 'MSG_GET_URL'
}

const ELEMENTS = {
    UNORDERED_LIST_SEARCH_TERMS : document.getElementById('listSearchTerms'),
    INPUT_SEARCH_TERM : document.getElementById('inputSearchTerm'),
    INPUT_CONTAINER_CLASS_NAME : document.getElementById('inputClassName'),
    INPUT_URL_KEY : document.getElementById('inputURLKey'),
    BUTTON_ERASE : document.getElementById('buttonDivErase'),
    BUTTON_STORE : document.getElementById('buttonStoreResults')
}

const KEY_CODES = {
    ENTER : 13,
    TAB : 9
}