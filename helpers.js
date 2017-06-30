Object.prototype.toArray = function () {
    let arr = [];
    for (key in this) {
        console.log(key);
        if (this.hasOwnProperty(key)) {
            arr.push({
                "key" : key,
                "values" : this[key]
            });
        }
    }
    return arr;
}