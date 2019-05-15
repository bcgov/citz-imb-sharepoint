window.console && console.log("vdr.js loaded");

/*
    cookie management
*/

function setCookie(cname, cvalue, cdays, cpath)
{
	var d = new Date();
    d.setTime(d.getTime() + (cdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();

//    if (cpath === undefined)
    {
    	cpath = "";
    }

    document.cookie = cname + "=" + cvalue + "; " + expires + "; " + "path=" + cpath;
}
function getCookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');

	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}