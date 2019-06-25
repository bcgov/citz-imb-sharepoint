var config = {}
var proponentID = "pID";
var SiteGUID = "f2c7e0ec-3c1a-4275-92fc-bc1802f95cbc"; //https://citz.sp.gov.bc.ca/sites/DEV/vt/_api/site/id

function writeActivity(action, info, success) {
    //TODO: function to write to ActivityLog list
    console.log(action, "|", info, "|", success, "|", proponentID, "|", _spPageContextInfo.userId);
}

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
                            writeActivity("Accepted Terms of Service", "", true);
                            $(this).dialog("close");
                        },
                        Decline: function () {
                            //chrome won't allow the dialog to close the parent window "Scripts may close only the windows that were opened by it."
                            //but ie will
                            writeActivity("Declined Terms of Service", "", true);
                            window.close();
                            window.location = "/_layouts/signout.aspx";
                        }
                    }
                });
            }
            createContent();
        })
        .fail(function (error) {
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
        writeActivity("Activate Proponent", ID, true);
        $("#vdr_proponent").remove();
        getProponents();
    }).fail(function (error) {
        writeActivity("Activate Proponent", "error " + error.status + ": " + error.statusText, false);
    });

    //create a group
    //add permissions to site
    //apply permissions to contribution library
    //apply permissions to question list

}

function deactivateProponent(ID, GroupID) {
    //update proponent list
    console.log("deactivate", ID, groupID);
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/lists/GetByTitle('Proponents')/Items(" + ID + ")",
        type: "POST",
        data: JSON.stringify(
            {
                "Active": false,
                "GroupId": ""
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
        writeActivity("Deactivate Proponent", ID, true);
        $("#vdr_proponent").remove();
        getProponents();
    }).fail(function (error) {
        writeActivity("Deactivate Proponent", "error " + error.status + ": " + error.statusText, false);
    });

    //delete a group
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/sitegroups/removebyid(" + GroupID + ")",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function (data) {

    }).fail(function (error) {
        window.console && console.log(error);
    });


}

function addProponent() {
    var addHtml = "<label for='input_proponent'>Enter Proponent Name</label>";
    addHtml += "<input type='text' name='input_proponent' id='input_proponent' class='text ui-widget-content ui-corner-all'>";

    //generate an 8 digit random hexadecimal number and append 'v' to the beginning
    var UUID = 'V' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    //TODO: change "_prefix - " to use the site name/url eg "VICO Template - "
    var groupName = "_prefix - " + UUID;

    var groupID;

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
                        var createNewGroup = createGroup(groupName, "created by automation", 242); //TOD: number should be dynamic
                        $.when(createNewGroup).then(function (data) {
                            writeActivity("Create Proponent Group", groupName, true);
                            var groupId = data;
                            //add to proponent list
                            $.ajax({
                                url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
                                    "/_api/web/lists/GetByTitle('Proponents')/Items",
                                type: "POST",
                                data: JSON.stringify(
                                    {
                                        "Title": $("#input_proponent").val(),
                                        "UUID": UUID,
                                        "GroupId": groupId
                                    }
                                ),
                                headers: {
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                    "Accept": "application/json;odata=nometadata",
                                    "Content-Type": "application/json;odata=nometadata"
                                }
                            }).done(function (data) {
                                writeActivity("Add Proponent to Proponent List", data.UUID, true);
                                $("#vdr_proponent").remove();
                                getProponents();
                            }).fail(function (error) {
                                writeActivity("Add Proponent to Proponent List", "error " + error.status + ": " + error.statusText, false);
                            });
                            //add permissions to site
                            $.when(grantGroupPermissionToWeb(groupId, "Read")).then(function () {
                                writeActivity("Grant Group Permission to Web", groupName, true);
                            }).fail(function () {
                                writeActivity("Grant Group Permission to Web", groupName, false);
                            });
                            //create a contribution library and apply permissions
                            //create a question list and apply permissions???
                        }).fail(function (error) {
                            writeActivity("Create Proponent Group", "error", false);
                        });
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
    //TODO: adduser
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
        propHtml += "Unique ID";
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
                propHtml += "<a onclick='deactivateProponent(" + results[i].ID + ", " + results[i].GroupId + ")' class='vdr_button ui-button ui-widget ui-corner-all'>Deactivate</a>"
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

function createContent() {
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

                tabcontent += "<div id='vdr_management_instructions'>";
                tabcontent += "<h3>instructions</h3>";
                tabcontent += "<div>"

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
                tabcontent += "</div>";

                $("#tabs").tabs().find(".ui-tabs-nav").append(tabheader);
                $("#tabs").tabs().append(tabcontent);
                $("#tabs").tabs().tabs("refresh");
                $("#vdr_management_instructions").accordion({
                    collapsible: true,
                    active: false,
                    heightStyle: "content"
                });
                getWebGroups();
                getProponents();
            },
            function (a, b) {
                window.console && console.log("unable to retrieve user permissions");
            }
        );
    }, "sp.js");
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


});
