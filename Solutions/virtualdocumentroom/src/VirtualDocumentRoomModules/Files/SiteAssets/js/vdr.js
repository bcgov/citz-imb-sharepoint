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
                            window.close();
                        }
                    }
                });
            }
        })
        .fail(function (error) {
            window.console && console.log(error);
        });
}

function getAccess() {
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/RoleAssignments?$expand=Member,Member/Users",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        }
    }).done(function (data) {
        console.log(data);
        var groupHtml = "<div id='vdr_group_data'>";
        var results = data.d.results;

        for (i = 0; i < results.length; i++) {
            groupHtml += "<h3>";
            groupHtml += results[i].Member.Title;
            groupHtml += "</h3>";
            groupHtml += "<div>"
            for (j = 0; j < results[i].Member.Users.results.length; j++) {
                groupHtml += "<div>";
                groupHtml += results[i].Member.Users.results[j].Title;
                groupHtml += "</div>";
            }
            groupHtml += "<a>";
            groupHtml += "add a user";
            groupHtml += "</a>";
            groupHtml += "</div>";
        }
        groupHtml += "</div>";
        $("#vdr_management").html(groupHtml);
        $("#vdr_group_data").accordion({
            collapsible: true,
            active: false,
            heightStyle: "content"
        });
    }).fail(function (error) {
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

    var html = "<div id=\"tabs\">";

    //tab links
    html += "<ul>";
    html += "<li><a href=\"#tab-1\">Home</a></li>";
    html += "<li><a href=\"#tab-2\">Questions</a></li>";
    html += "</ul>";

    //home tab content
    html += "<div id=\"tab-1\" class=\"tabcontent home_tab active\">";
    html += "<h2>Home</h2>";
    html += "<p>introduction to the site, instructions, links to procurement documents and resources.</p>";
    html += "</div>";

    //question tab content
    html += "<div id=\"tab-2\" class=\"tabcontent question_tab\">";
    html += "<h2>Questions</h2>";
    html += "<p>list of public questions and answers.  link to ask a question.</p>";
    html += "</div>";

    html += "</div>";

    $("#vdr_container").append(html);

    $(function () {
        $("#tabs").tabs({
            heightStyle: "auto"
        });
    });

    //add management tab if manage web permissions
    ExecuteOrDelayUntilScriptLoaded(function () {
        var ctx = new SP.ClientContext.get_current();
        var web = ctx.get_web();

        var ob = new SP.BasePermissions();
        ob.set(SP.PermissionKind.manageWeb)

        var per = web.doesUserHavePermissions(ob)
        ctx.executeQueryAsync(
            function () {
                var tabheader = "<li><a href=\"#tab-3\">Site Management</a></li>";
                var tabcontent = "<div id=\"tab-3\" class=\"tabcontent management_tab\">";
                tabcontent += "<h2>Site Management</h2>";
                tabcontent += "<div id='vdr_management'>";
                tabcontent += "loading....";
                tabcontent += "</div>";

                tabcontent += "<div>";
                tabcontent += "<ul>";
                tabcontent += "<li>Tab to be visible only to VICO Site Administrators</li>";
                tabcontent += "<ul>";
                tabcontent += "<li>VICO Administrator - administrates and grants access to the VICO site (a site owner)</li>";
                tabcontent += "<li>VICO Manager - uploads documents and answers questions (a member)</li>";
                tabcontent += "<li>Proponent - a business interested in the procurement (no direct access)</li>";
                tabcontent += "<li>User - a specified BCeID user account identified by the proponent (a restricted member)</li>";
                tabcontent += "</ul>";
                tabcontent += "<li>Contains links and instructions on how to add proponents and users</li>";
                tabcontent += "<li>Add proponent to site</li>";
                tabcontent += "<ul>";
                tabcontent += "<li>generate a random string as a non-identifiable object name for all things related to proponent</li>";
                tabcontent += "<li>create a group</li>";
                tabcontent += "<li>create a contribution library</li>";
                tabcontent += "<li>create a question list?</li>";
                tabcontent += "</ul>";
                tabcontent += "<li>be able to add users to proponents</li>";
                tabcontent += "<li>have the ability to remove a users access</li>";
                tabcontent += "<li>all actions are to be logged (type, info, proponent, user, date, time, etc.)</li>";
                tabcontent += "<li>shortlist proponents (ie deactivate a proponent and remove users access)</li>";
                tabcontent += "</div>";
                tabcontent += "</div>";

                $("#tabs").tabs().find(".ui-tabs-nav").append(tabheader);
                $("#tabs").tabs().append(tabcontent);
                $("#tabs").tabs().tabs("refresh");

                getAccess();
            },
            function (a, b) {
                console.log("Something wrong");
            }
        );
    }, "sp.js");

});
