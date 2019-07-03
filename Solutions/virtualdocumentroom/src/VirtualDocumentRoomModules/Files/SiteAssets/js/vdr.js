var config = {}
var siteGUID;
var ownerGroupID;
var memberGroupID;
var visitorGroupID;
var groupPrefix;
var groupDescription = "created by automation";
var currentUser;

function initateVariables() {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web?$expand=AssociatedOwnerGroup,AssociatedMemberGroup,AssociatedvisitorGroup",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        siteGUID = data.d.Id
        ownerGroupID = data.d.AssociatedOwnerGroup.Id;
        memberGroupID = data.d.AssociatedMemberGroup.Id;
        visitorGroupID = data.d.AssociatedVisitorGroup.Id;
        groupPrefix = config.GroupPrefix.TextValue;
    }).fail(function (error) {
        console.log(error);
    });
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/CurrentUser",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        currentUser = data.d.Title;
    }).fail(function (error) {
        console.log(error);
    });
}

function writeActivity(action, info, success) {
    $.ajax({
        url: "https://" + window.location.hostname + _spPageContextInfo.webServerRelativeUrl +
            "/_api/web/lists/GetByTitle('ActivityLog')/Items",
        type: "POST",
        data: JSON.stringify(
            {
                "Title": action,
                "Notes": info.toString(),
                "Success": success,
                "User": currentUser
            }
        ),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata"
        }
    }).done(function () {
        console.log(action, info, success, currentUser);
    }).fail();
}

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
        headers: {
            "accept": "application/json;odata=verbose"
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

function activateProponent(ID, UUID) {

    //create new proponent group
    $.when(createGroup(groupPrefix + UUID, groupDescription, ownerGroupID)).then(function (groupId) {
        writeActivity("Create Proponent Group", groupPrefix + UUID, true);
        //update proponent list
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl +
                "/_api/web/lists/GetByTitle('Proponents')/Items(" + ID + ")",
            type: "POST",
            data: JSON.stringify(
                {
                    "Active": true,
                    "GroupId": groupId
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
            writeActivity("Updated Proponent", UUID, true);
            displayProponents();
        }).fail(function (error) {
            writeActivity("Updated Proponent", "error " + error.status + ": " + error.statusText, false);
        });
        //add permissions to site
        $.when(grantGroupPermissionToWeb(groupId, "Read")).then(function () {
            displayWebGroups();
            writeActivity("Grant Group Permission to Site", groupPrefix + UUID, true);
        }).fail(function () {
            writeActivity("Grant Group Permission to Site", groupPrefix + UUID, false);
        });
        //apply permissions to contribution library
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl +
                "/_api/web/lists/GetByTitle('" + UUID + "')",
            type: "GET",
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-Type": "application/json;odata=nometadata"
            }
        }).done(function (listData) {
            $.when(grantGroupPermissionToList(listData.Id, groupId, "Contribute")).then(function (error) {
                writeActivity("Apply Permissions to Proponent Library", UUID, true);
            }).fail(function (error) {
                writeActivity("Apply Permissions to Proponent Library", "error " + error.status + ": " + error.statusText, false);
            });
        }).fail(function (error) {
            writeActivity("Grant Permission to Proponent Library", "error " + error.status + ": " + error.statusText, false);
        });
    }).fail(function (error) {
        writeActivity("Create Proponent Group", "error " + error.status + ": " + error.statusText, false);
    });
}

function deactivateProponent(itemId, groupId, UUID) {
    //delete proponent group
    $.when(deleteGroup(groupId)).then(function () {
        writeActivity("Delete Proponent group", UUID, true);
        //update proponent list
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl +
                "/_api/web/lists/GetByTitle('Proponents')/Items(" + itemId + ")",
            type: "POST",
            data: JSON.stringify(
                {
                    "Active": false,
                    "GroupId": 0
                }
            ),
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Accept": "application/json;odata=nometadata",
                "Content-Type": "application/json;odata=nometadata",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            }
        }).done(function () {
            writeActivity("Deactivate Proponent", UUID, true);
            displayWebGroups();
            displayProponents();
        }).fail(function (error) {
            writeActivity("Deactivate Proponent", "error " + error.status + ": " + error.statusText, false);
        });
    }).fail(function (error) {
        writeActivity("Delete Proponent group", "error " + error.status + ": " + error.statusText, false);
    });
}

function addProponent() {
    var addHtml = "<label for='input_proponent'>Enter Proponent Name</label>";
    addHtml += "<input type='text' name='input_proponent' id='input_proponent' class='text ui-widget-content ui-corner-all'>";

    //generate an 8 digit random hexadecimal number and append 'v' to the beginning
    var UUID = 'V' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    var groupName = groupPrefix + UUID;

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
                        $.when(createGroup(groupName, groupDescription, ownerGroupID)).then(function (data) {
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
                                displayProponents();
                            }).fail(function (error) {
                                writeActivity("Add Proponent to Proponent List", "error " + error.status + ": " + error.statusText, false);
                            });
                            //add permissions to site
                            $.when(grantGroupPermissionToWeb(groupId, "Read")).then(function () {
                                displayWebGroups();
                                writeActivity("Grant Group Permission to Site", groupName, true);
                            }).fail(function () {
                                writeActivity("Grant Group Permission to Site", groupName, false);
                            });
                            //create a contribution library and apply permissions
                            $.ajax({
                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists",
                                type: "POST",
                                headers: {
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                    "accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose"
                                },
                                data: JSON.stringify({
                                    "__metadata": { "type": "SP.List" },
                                    "AllowContentTypes": true,
                                    "BaseTemplate": 101,
                                    "ContentTypesEnabled": true,
                                    "Description": "Proponent Contribution Library.  created by automation",
                                    "Title": UUID
                                })
                            }).done(function (data) {
                                writeActivity("Create Proponent Library", UUID, true);
                                //break inheritence and apply permissions to contribution library
                                $.when(breakListInheritance(data.d.Id, false)).then(function () {
                                    writeActivity("Break inheritance on Proponent Library", UUID, true);
                                    $.when(grantGroupPermissionToList(data.d.Id, ownerGroupID, "Full Control"),
                                        grantGroupPermissionToList(data.d.Id, memberGroupID, "Contribute"),
                                        grantGroupPermissionToList(data.d.Id, visitorGroupID, "Read"),
                                        grantGroupPermissionToList(data.d.Id, groupId, "Contribute")).then(function (error) {
                                            writeActivity("Apply permissions to Proponent Library", UUID, true);
                                        }).fail(function (error) {
                                            writeActivity("Apply permissions to Proponent Library", "error " + UUID, false);
                                        });
                                }).fail(function (error) {
                                    writeActivity("Break inheritance on Proponent Library", "error " + error.status + ": " + error.statusText, false);
                                });
                            }).fail(function (error) {
                                writeActivity("Create Proponent Library", "error " + error.status + ": " + error.statusText, false);
                            });
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

function initializePeoplePicker(peoplePickerElementId) {
    var schema = {};
    schema['PrincipalAccountType'] = 'User';
    schema['SearchPrincipleSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMulitpleValues'] = true;
    schema['MaximumEntitySuggestions'] = 5;
    schema['Width'] = '280px';
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
}


function addUser(groupId) {
    var addHtml = "<div id='vdr_user_dialog'>";
    addHtml += "<label>Enter Name</label>";
    addHtml += "<div id='input_user'></div>";
    addHtml += "</div>";

    $("#vdr_dialog").html(addHtml);

    initializePeoplePicker("input_user");

    $("#vdr_dialog").dialog({
        dialogClass: "no-close",
        title: "Add a User",
        height: 250,
        width: 350,
        buttons: {
            "Create": function () {
                SP.SOD.executeFunc('clientpeoplepicker.js', 'SPClientPeoplePicker', function () {
                    var peoplePickerTopDivId = $('#input_user').children().children().attr('id');
                    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerTopDivId];
                    var users = peoplePicker.GetAllUserInfo();
                    for (i = 0; i < users.length; i++) {
                        addUserToGroup(groupId, users[i].Key);
                        writeActivity("add a user", "group: " + groupId + " | user: " + users[i].DisplayText, true);
                    }
                    displayWebGroups();
                });
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });
}

function removeUser(groupId, userId) {
    $.when(removeUserFromGroup(groupId, userId)).then(function () {
        writeActivity("Remove user", "group: " + groupId + " | user: " + userId, true);
        displayWebGroups();
    });
}

function displayProponents() {
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
                propHtml += "<a onclick='deactivateProponent(" + results[i].ID + ", " + results[i].GroupId + ",\"" + results[i].UUID + "\")' class='vdr_button ui-button ui-widget ui-corner-all'>Deactivate</a>"
            } else {
                propHtml += "<a onclick='activateProponent(" + results[i].ID + ",\"" + results[i].UUID + "\")' class='vdr_button ui-button ui-widget ui-corner-all'>Activate</a>"

            }
            propHtml += "</div>";
        }

        propHtml += "</div>";
        $("#vdr_proponent").remove();
        $("#vdr_management").append(propHtml);

    }).fail(function (error) {
        window.console && console.log(error);
    });
}

function displayWebGroups() {
    $.when(getWebGroups(true)).then(function (data) {
        var groupHtml = "<div id='vdr_group_data'>";

        for (i = 0; i < data.length; i++) {
            groupHtml += "<h3>";
            groupHtml += data[i].Title;
            groupHtml += "</h3>";
            groupHtml += "<div id='vdr_user_rows'>"
            groupHtml += "<div class='vdr_user_row_header'>";
            groupHtml += "<div class='vdr_user_title'>";
            groupHtml += "</div>";
            groupHtml += "<a onclick='addUser(" + data[i].Id + ")' class='ui-button ui-widget ui-corner-all vdr_button'>";
            groupHtml += "add a user";
            groupHtml += "</a>";
            groupHtml += "</div>";
            for (j = 0; j < data[i].Users.results.length; j++) {
                groupHtml += "<div class='vdr_user_row'>";
                groupHtml += "<div class='vdr_user_title'>";
                groupHtml += data[i].Users.results[j].Title;
                groupHtml += "</div>";
                groupHtml += "<a onclick='removeUser(" + data[i].Id + ", " + data[i].Users.results[j].Id + ")' class='ui-button ui-widget ui-corner-all vdr_button'>";
                groupHtml += "remove user";
                groupHtml += "</a>";
                groupHtml += "</div>"
            }
            groupHtml += "</div>";
        }
        groupHtml += "</div>";
        $("#vdr_group_data").remove();
        $("#vdr_management").append(groupHtml);
        $("#vdr_group_data").accordion({
            collapsible: true,
            active: false,
            heightStyle: "content"
        });
    }).fail(function (error) {
        window.console && console.log("error", error);
    });

    /*

        */
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
                initateVariables();
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
                displayWebGroups();
                displayProponents();
            },
            function (a, b) {
                window.console && console.log("unable to retrieve user permissions");
            }
        );
    }, "sp.js");
}

$().ready(function () {
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("link");
    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = _spPageContextInfo.webAbsoluteUrl + "/SiteAssets/css/vdr.css";
    head.appendChild(style);

    //add the js libraries needed for peoplepicker
    var clienttemplates = document.createElement("script");
    clienttemplates.type = "text/javascript";
    clienttemplates.src = "_layouts/15/clienttemplates.js";
    head.appendChild(clienttemplates);
    var clientforms = document.createElement("script");
    clientforms.type = "text/javascript";
    clientforms.src = "_layouts/15/clientforms.js";
    head.appendChild(clientforms);
    var clientpeoplepicker = document.createElement("script");
    clientpeoplepicker.type = "text/javascript";
    clientpeoplepicker.src = "_layouts/15/clientpeoplepicker.js";
    head.appendChild(clientpeoplepicker);
    var autofill = document.createElement("script");
    autofill.type = "text/javascript";
    autofill.src = "_layouts/15/autofill.js";
    head.appendChild(autofill);



    //create a dialog element
    $("body").append("<div id='vdr_dialog'></div>");
    //create content element
    $("#layoutsTable").append("<div id='vdr_container'></div>");

    getTOS();
});
