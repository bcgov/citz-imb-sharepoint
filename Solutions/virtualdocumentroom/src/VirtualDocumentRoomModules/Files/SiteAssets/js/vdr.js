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
            var cname = "TOSAgreement" + config.TOS.Modified;

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

function getGroups() {
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/RoleAssignments?$expand=Member,Member/Users",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        }
    }).done(function (data) {
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
            groupHtml += "<a onclick='addUser()' class='ui-button ui-widget ui-corner-all'>";
            groupHtml += "add a user";
            groupHtml += "</a>";
            groupHtml += "</div>";
        }
        groupHtml += "</div>";
        $("#vdr_management").append(groupHtml);
        $("#vdr_group_data").accordion({
            collapsible: true,
            active: false,
            heightStyle: "content"
        });
    }).fail(function (error) {
        window.console && console.log(error);
    });
}

function activateProponent(ID) {
    //update proponent list
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/lists/GetByTitle('Proponents')/Items(" + ID + ")",
        type: "POST",
        data: JSON.stringify(
            {
                "Active": true
            }
        ),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata",
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        }
    }).done(function (data) {
        console.log(data);
        $("#vdr_proponent").remove();
        getProponents();
    }).fail(function (error) {
        window.console && console.log(error);
    });

    //create a group
    //add permissions to site
    //apply permissions to contribution library
    //apply permissions to question list
    console.log("activate proponent");
}

function deactivateProponent(ID) {
    //update proponent list

    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/lists/GetByTitle('Proponents')/Items(" + ID + ")",
        type: "POST",
        data: JSON.stringify(
            {
                "Active": false
            }
        ),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata",
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        }
    }).done(function (data) {
        console.log(data);
        $("#vdr_proponent").remove();
        getProponents();
    }).fail(function (error) {
        window.console && console.log(error);
    });

    //delete a group

    console.log("deactivate proponent");
}

function addProponent() {
    var addHtml = "<label for='input_proponent'>Enter Proponent Name</label>";
    addHtml += "<input type='text' name='input_proponent' id='input_proponent' class='text ui-widget-content ui-corner-all'>";

    //generate an 8 digit random hexadecimal number and append 'v' to the beginning
    var UUID = 'V' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    var groupName = "_prefix - " + UUID;


    $("#vdr_dialog").html(addHtml).dialog({
        dialogClass: "no-close",
        title: "Add a Proponent",
        buttons: [
            {
                text: "Create",
                click: function () {
                    if ($("#input_proponent").val() === "") {
                        alert("Proponent Name is required.")
                    } else {


                        //add to proponent list
                        $.ajax({
                            url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
                                "/_api/web/lists/GetByTitle('Proponents')/Items",
                            type: "POST",
                            data: JSON.stringify(
                                {
                                    "Title": $("#input_proponent").val(),
                                    "UUID": UUID
                                }
                            ),
                            headers: {
                                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                "Accept": "application/json;odata=nometadata",
                                "Content-Type": "application/json;odata=nometadata"
                            }
                        }).done(function (data) {
                            $("#vdr_proponent").remove();
                            getProponents();
                        }).fail(function (error) {
                            window.console && console.log(error);
                        });

                        //create a group
                        $.ajax({
                            url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
                                "/_api/web/sitegroups",
                            type: "POST",
                            data: JSON.stringify(
                                {
                                    'Title': groupName,
                                    'Description': 'some words about the vico site.  created by automation.'
                                }
                            ),
                            headers: {
                                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                "Accept": "application/json;odata=nometadata",
                                "Content-Type": "application/json;odata=nometadata"
                            }
                        }).done(function (data) {
                            console.log("group", data);
                            //update group
                            $.ajax({
                                url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
                                    "/_api/web/sitegroups(" + data.Id + ")",
                                type: "POST",
                                data: JSON.stringify(
                                    {
                                        'Description': 'updated by automation.'
                                    }
                                ),
                                headers: {
                                    "Content-Type": "application/json;odata=nometadata",
                                    "X-HTTP-Method": "MERGE"
                                }
                            }).done(function (data) {
                                console.log("data", data);

                            }).fail(function (error) {
                                window.console && console.log(error);
                            });
                        }).fail(function (error) {
                            window.console && console.log(error);
                        });
                        //add permissions to site
                        //create a contribution library and apply permissions
                        //create a question list and apply permissions???


                        $(this).dialog("close");
                    }
                }
            },
            {
                text: "Cancel",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ]
    });
}

function addUser() {
    console.log("add user");
}

function getProponents() {
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/lists/GetByTitle('Proponents')/Items",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
        }
    }).done(function (data) {
        var results = data.d.results;

        var propHtml = "<div id='vdr_proponent'>";
        //header row
        propHtml += "<div class='vdr_proponent_header'>";
        propHtml += "<div class='vdr_proponent_name'>";
        propHtml += "Proponent";
        propHtml += "</div>";
        propHtml += "<div class='vdr_proponent_uid'>";
        propHtml += "Unique Identifier";
        propHtml += "</div>";
        propHtml += "<a onclick='addProponent()' id='vdr_add_proponent' class='vdr_button ui-button ui-widget ui-corner-all'>Add a Proponent</a>"
        propHtml += "</div>";

        //data block
        propHtml += "<div class='vdr_proponent_data'>";

        //detail rows
        for (i = 0; i < results.length; i++) {
            var inactive = (results[i].Active) ? "" : " vdr_inactive ";

            propHtml += "<div class='vdr_proponent_row'>";
            propHtml += "<div class='vdr_proponent_name" + inactive + "'>";
            propHtml += results[i].Title;
            propHtml += "</div>";
            propHtml += "<div class='vdr_proponent_uid" + inactive + "'>";
            propHtml += results[i].UUID;
            propHtml += "</div>";
            if (inactive == "") {
                propHtml += "<a onclick='deactivateProponent(" + results[i].ID + ")' class='vdr_button ui-button ui-widget ui-corner-all'>Deactivate</a>"
            } else {
                propHtml += "<a onclick='activateProponent(" + results[i].ID + ")' class='vdr_button ui-button ui-widget ui-corner-all'>Activate</a>"

            }
            propHtml += "</div>";
        }

        propHtml += "</div>";

        $("#vdr_management").append(propHtml);

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
    //create content element
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

                getGroups();
                getProponents();
            },
            function (a, b) {
                console.log("unable to retrieve user permissions");
            }
        );
    }, "sp.js");

});
