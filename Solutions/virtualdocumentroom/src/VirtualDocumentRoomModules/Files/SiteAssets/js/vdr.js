var config = {}
$().ready(function () {
    //create a dialog element
    $("body").append("<div id='vdr_dialog'></div>");

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Config')?$expand=Items",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        }
    })
        .done(function (data) {
            //get config values
            for (i = 0; i < data.d.Items.results.length; i++) {
                config[data.d.Items.results[i].Key] = {};
                config[data.d.Items.results[i].Key].TextValue = data.d.Items.results[i].TextValue;
                config[data.d.Items.results[i].Key].MultiTextValue = data.d.Items.results[i].MultiTextValue;
                config[data.d.Items.results[i].Key].NumberValue = data.d.Items.results[i].NumberValue;
                config[data.d.Items.results[i].Key].YesNoValue = data.d.Items.results[i].YesNoValue;
                config[data.d.Items.results[i].Key].GroupValue = data.d.Items.results[i].GroupValue;
                config[data.d.Items.results[i].Key].Modified = data.d.Items.results[i].Modified;
            }
            //show the TOS
            const cname = "TOSAgreement" + config.TOS.Modified;

            if (!getCookie(cname)) {
                $("#vdr_dialog").html(config.TOS.MultiTextValue).dialog({
                    modal: true,
                    buttons: {
                        Accept: function () {
                            setCookie(cname, "true", config.CookieDays.NumberValue, _spPageContextInfo.webAbsoluteUrl);
                            $(this).dialog("close");
                        },
                        Decline: function () {
                            window.location = "/_layouts/signout.aspx";
                        }
                    }
                });
            }

        })
        .fail(function (error) {
            window.console && console.log(error);
        });
});
/*
    cookie management
*/

function setCookie(cname, cvalue, cdays, cpath) {
    var d = new Date();
    d.setTime(d.getTime() + (cdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();

    if (cpath === undefined) {
        cpath = "";
    }

    document.cookie = cname + "=" + cvalue + "; " + expires + "; " + "path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
