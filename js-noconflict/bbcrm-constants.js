var api_path = '';

if(typeof getTest('test') !== 'undefined')
    api_path = getTest('test')+/bbcrmapi/;
else {
    //client specific APIs
    if(
        window.location.hostname == 'lbastgng.wpengine.com' ||
        window.location.hostname == 'www.lbaweb.com' ||
        window.location.hostname == 'lbaweb.com'
    ) {
        api_path = 'https://libertyapi.verticacrm.com/api/bbcrmapi/';
    } else if (
        window.location.hostname == 'www.promed-financial.com' ||
        window.location.hostname == 'promed-financial.com'
    ) {
        //api_path = 'https://promedapi.businessbrokerscrm.com/api/bbcrmapi/';
        api_path = 'https://api1.verticacrm.com/api/bbcrmapi/';
    } else {
        api_path = 'https://api1.verticacrm.com/api/bbcrmapi/';
    }
}
// There is no document viewer defined for a test api so we will use the server's for now
// This might need rethinking
document_viewer='http://documentviewer1.businessbrokerscrm.com/viewer';
function getTest(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}
