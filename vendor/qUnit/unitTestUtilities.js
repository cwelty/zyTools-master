/*
    More robust typeof() function, can discern things like if an object is array, regex, date, etc. 
    Expects an object
    Returns String description based on object type of:
        object, array, arguments, error, date, regexp, math, json, number, string, boolean
    Based off of information found here: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
*/
function toType(obj) {
    return ({}).toString.call(obj).slice(8).slice(0,-1).toLowerCase();
}