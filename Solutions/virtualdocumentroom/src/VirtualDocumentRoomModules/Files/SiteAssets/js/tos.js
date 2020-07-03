function getTOS() {
    console.log("-- getting TOS");
    var defer = $.Deferred();
    //show the TOS
    var cname = "TOSAgreement" + config.TOS.Modified;

    if (!getCookie(cname)) {
        $("#vdr_dialog").html(config.TOS.MultiTextValue).dialog({
            modal: true,
            buttons: {
                Accept: function () {
                    setCookie(cname, "true", config.CookieDays.NumberValue, _spPageContextInfo.webAbsoluteUrl);
                    $(this).dialog("close");
                    $("#vdr_dialog").html("");
                    defer.resolve("Accepted Terms of Service");
                },
                Decline: function () {
                    $("#vdr_dialog").html("");
                    defer.reject("Rejected Terms of Service");
                }
            }
        });
    } else {
        defer.resolve("Previously accepted Terms of Service");
    }

    return defer.promise();
}