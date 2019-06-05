var config = {}

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

function getTOS() {
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
}

$().ready(function () {
    var cssUrl = "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
        "/SiteAssets/css/vdr.css";
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = cssUrl;
    head.appendChild(style);

    //create a dialog element
    $("body").append("<div id='vdr_dialog'></div>");
    //creaate content element
    $("#layoutsTable").append("<div id='vdr_container'></div>");

    getTOS();

    var html = "<div id=\"tabs\"><ul>";
    html += "<li><a href=\"#tabs-1\">Home</a></li>";
    html += "<li><a href=\"#tabs-2\">Questions</a></li>";
    html += "<li><a href=\"#tabs-3\">Site Management</a></li>";
    html += "</ul></div>";

    html += "<div id=\"tabs-1\" class=\"tabcontent home_tab active\">";
    html += "<h3>Home</h3>";
    html += "<p>Home is where the heart is..</p>";
    html += "</div>";

    html += "<div id=\"tabs-2\" class=\"tabcontent question_tab\">";
    html += "<h3>News</h3>";
    html += "<p>Some news this fine day!</p>";
    html += "</div>";

    html += "<div id=\"tabs-3\" class=\"tabcontent management_tab\">";
    html += "<h3>Contact</h3>";
    html += "<p>Get in touch, or swing by for a cup of coffee.</p>";
    html += "</div>";

    $("#vdr_container").append(html);

    $(function () {
        $("#tabs").tabs();
    });

    $(".tablink").click(function () {
        $(".tablink").removeClass("active");
        $(".tabcontent").removeClass("active");
        $("." + $(this).data("tab")).addClass("active");
    });


});
