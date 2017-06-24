'use strict';
var searchTerms = ["python", "lebron","clippers", "new"];
var elementClassName = "thing";
var elements = document.getElementsByClassName(elementClassName);
for (let i = elements.length - 1; 0 <= i; i--) {
    let element = elements[i];
    let stringContent = element.textContent.toLowerCase();
    if (searchTerms.some(function (term) {
            return stringContent.includes(term);
        })) {
        console.log(element.textContent);
        element.remove();
    }
}