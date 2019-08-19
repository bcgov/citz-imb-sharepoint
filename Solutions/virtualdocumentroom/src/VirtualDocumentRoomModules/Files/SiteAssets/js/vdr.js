var config = {}
var siteGUID;
var ownerGroupID;
var memberGroupID;
var visitorGroupID;
var groupPrefix;
var groupDescription = "created by automation";
var currentUser;

function initateVariables() {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Config')?$expand=Items",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
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

        //get group information
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
            defer.resolve();
        }).fail(function (error) {
            console.log(error);
            defer.reject();
        });

    }).fail(function (error) {
        window.console && console.log(error);
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

    return defer.promise();
}

function writeActivity(action, info, success) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('ActivityLog')/Items",
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
        console.log("wrote activity:", "", action, info, success, currentUser);
    }).fail(
        //console.log("failed to write Activity:", action, info, success, currentUser)
    );
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

function addToProponentList(UUID, groupId) {
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
}

function createContributionLibrary(UUID) {
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
}

function createQuestionList(UUID) {
    var title = UUID + "_Questions";

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
            "BaseTemplate": 100,
            "ContentTypesEnabled": true,
            "Description": "Proponent Question List.  created by automation",
            "Title": title
        })
    }).done(function (data) {
        writeActivity("Create Proponent Question List", UUID + "_Questions", true);
        //break inheritence and apply permissions to contribution library
        $.when(breakListInheritance(data.d.Id, false)).then(function () {
            writeActivity("Break inheritance on Proponent Question List", UUID + "_Questions", true);
            $.when(grantGroupPermissionToList(data.d.Id, ownerGroupID, "Full Control"),
                grantGroupPermissionToList(data.d.Id, memberGroupID, "Contribute"),
                grantGroupPermissionToList(data.d.Id, visitorGroupID, "Read"),
                grantGroupPermissionToList(data.d.Id, groupId, "Contribute")).then(function (error) {
                    writeActivity("Apply permissions to Proponent Question List", UUID + "_Questions", true);
                }).fail(function (error) {
                    writeActivity("Apply permissions to Proponent Question List", "error " + UUID + "_Questions", false);
                });
        }).fail(function (error) {
            writeActivity("Break inheritance on Proponent Question List", "error " + error.status + ": " + error.statusText, false);
        });
        //add Question Fields
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + title + "')/fields",
            type: "POST",
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose"
            },
            data: JSON.stringify({
                "__metadata": { "type": "SP.Field" },
                "FieldTypeKind": 3,
                "StaticName": "Question",
                "Title": "Question"
            })
        }).done(function (data) {
            //console.log("mydata", data);
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + title + "')/fields/getbytitle('Title')",
                type: "POST",
                headers: {
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-HTTP-Method": "MERGE",
                    "If-Match": "*"
                },
                data: JSON.stringify({
                    "__metadata": { "type": "SP.Field" },
                    "Required": 'false',
                    "Hidden": 'true'
                })
            }).done(function (data) {
                //console.log("mydata", data);
            }).fail(function (err) {
                console.log(err);
            })
        }).fail(function (err) {
            console.log(err);
        })

    }).fail(function (error) {
        writeActivity("Create Proponent Question List", "error " + error.status + ": " + error.statusText, false);
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
                            addToProponentList(UUID, groupId);

                            //add permissions to site
                            $.when(grantGroupPermissionToWeb(groupId, "Read")).then(function () {
                                displayWebGroups();
                                writeActivity("Grant Group Permission to Site", groupName, true);
                            }).fail(function () {
                                writeActivity("Grant Group Permission to Site", groupName, false);
                            });
                            //create a contribution library and apply permissions
                            createContributionLibrary(UUID);
                            //create a question list and apply permissions
                            createQuestionList(UUID);
                        }).fail(function (error) {
                            writeActivity("Create Proponent Group", "error", false);
                        });
                        $(this).dialog("close");
                        $("#vdr_dialog").html("");
                    }
                }
            },
            {
                text: "Cancel",
                click: function () {
                    $(this).dialog("close");
                    $("#vdr_dialog").html("");
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

function getUUID(groupId) {
    var defer = $.Deferred();

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/lists/getbytitle('proponents')/items?$filter=GroupId eq " + groupId,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        if (data.d.results.length > 0) {
            defer.resolve(data.d.results[0].UUID);
        }
        defer.resolve();
    }).fail(function (err) {
        console.log(err);
    });

    return defer.promise();
}

function addUserToList(group, user) {
    $.when(getUUID(group)).done(function (UUID) {
        console.log("addUserToList", group, user, UUID);

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Users')/items",
            type: "POST",
            data: JSON.stringify({
                "User": user,
                "QuestionList": UUID + "_Questions"
            }),
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Accept": "application/json;odata=nometadata",
                "Content-Type": "application/json;odata=nometadata"
            }
        }).done(function (data) {
            console.log("added to users list:", data);
        }).fail(function (err) {
            console.log(err);
        });
    })

}

function removeUserFromList() {
    console.log("removeUserFromList", arguments);
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web"
    }).done(function(data){
        console.log(data)
    }).fail(function(err){
        console.log(err);
    });
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
                        addUserToList(groupId, users[i].EntityData.AccountName.toLowerCase());
                    }
                    displayWebGroups();
                });
                $(this).dialog("close");
                $("#vdr_dialog").html("");
            },
            "Cancel": function () {
                $(this).dialog("close");
                $("#vdr_dialog").html("");
            }
        }
    });
}

function removeUser(groupId, userId) {
    $.when(removeUserFromGroup(groupId, userId)).then(function () {
        removeUserFromList(groupId, userId);
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

function populateHomeTab() {
    var html = "<h2>Home</h2>";
    html += "<p>introduction to the site, instructions, links to procurement documents and resources.</p>";

    html += "<div id='vdr_home_instructions'>";
    html += "<h3>instructions</h3>";

    html += "<div>";
    html += "<ul>TO DO:";
    html += "<li>apply starting permissions for lists and libraries</li>";
    html += "<ul>";
    html += "</div>";

    html += "</div>";

    $("#tab-1").append(html);

    $("#vdr_home_instructions").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
}

function addQuestionToList(question){
    alert("addQuestionToList: " + question);
    writeActivity("add a question", question , true);
}

function askAQuestion() {
    var addHtml = "<div id='vdr_user_dialog'>";
    addHtml += "<label>Enter Question</label>";
    addHtml += "<input id='input_question' type='text' name='input_question' class='text ui-widget-content ui-corner-all' />";
    addHtml += "</div>";

    $("#vdr_dialog").html(addHtml);

    $("#vdr_dialog").dialog({
        dialogClass: "no-close",
        title: "Ask a Question",
        height: 250,
        width: 350,
        buttons: {
            "Create": function () {
                        addQuestionToList($("#input_question").val());
                    
                $(this).dialog("close");
                $("#vdr_dialog").html("");
            },
            "Cancel": function () {
                $(this).dialog("close");
                $("#vdr_dialog").html("");
            }
        }
    });
}

function populateQuestionTab() {
    var html = "<h2>Questions</h2>";

    html += "<div id='vdr_questions'>";

    html += "<div id='vdr_public_questions_data'>"
    html += "<table id='vdr_public_questions' class='stripe hover row-border'>"
    html += "<thead>";
    html += "<tr>";
    html += "<th>Question</th>";
    html += "<th>Answer</th>";
    html += "</tr>";
    html += "</thead>";
    html += "</table>"
    html += "</div>";

    html += "<div id='vdr_private_questions_data'>";
    html += "<table id='vdr_private_questions' class='stripe hover row-border'>"
    html += "<thead>";
    html += "<tr>";
    html += "<th>Question</th>";
    html += "</tr>";
    html += "</thead>";
    html += "</table>"
    html += "</div>";

    html += "</div>";

    html += "<div id='vdr_question_instructions'>";
    html += "<h3>instructions</h3>";

    html += "<div>";
    html += "<ul>";
    html += "<li>Proponent is notified when a question is answered - is this manual?</li>";
    html += "<li>Users to have the ability to post questions on the VICO site to the VICO staff</li>";
    html += "<li>questions to  be viewable to the posting proponent group only until the question is published</li>";
    html += "<li>any question posted by a proponent to be read only after submissiion</li>";
    html += "<li>to be able to categorize  questions</li>";
    html += "<li>Users to receive instant confirmation to a submitted question</li>";
    html += "<li>all transactions on the VICO site to be logged. Log information must include transaction type, transaction information, proponent and user , date and time of the transaction</li>";
    html += "<li>An auto response acknowledgment  sent when a user asks a question; acknowledgment should be sent to the asking proponent group only</li>";
    html += "<li>All users to receive a notification when a response is posted</li>";
    html += "<li>the notification to contain a link to the VICO website</li>";
    html += "<li>The response to a question to go together with the question</li>";
    html += "<li>The system to log information when a proponent asking a question reads the response. Information should include proponent ID, question,  date and time the response was read</li>";
    html += "<ul>";
    html += "</div>";
    html += "</div>";

    html += "</div>";

    $("#tab-2").append(html);

    //get the public questions
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('questions')/items",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (data) {
        var dataSet = data.d.results;
        $("#vdr_public_questions").DataTable({
            data: dataSet,
            dom: 'ftp',
            columns: [
                {
                    data: "Question",
                    orderable: false
                },
                {
                    data: "Answer",
                    orderable: false
                }

            ],
            rowGroup: {
                dataSrc: "Category"
            }
        });
        $("#vdr_public_questions").css("width", "");
    });

    //check if current user is associated with a private questions list
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Users')/items?$filter=User eq '" + _spPageContextInfo.userLoginName + "'",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        }
    }).done(function (userData) {
        console.log("userData", userData)
        if (userData.d.results.length > 0) {
            //current user is associated with a private questions list
            //get the private questions
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +
                    userData.d.results[0].QuestionList + "')/items",
                type: "GET",
                headers: {
                    "accept": "application/json;odata=verbose"
                }
            }).done(function (data) {
                //display the private questions
                var dataSet = data.d.results;
                $("#vdr_private_questions").DataTable({
                    data: dataSet,
                    dom: 'Bftp',
                    buttons: [
                        {
                            text: 'ask a question',
                            action: function () { askAQuestion(); }
                        }
                    ],
                    columns: [
                        {
                            data: "Question",
                            orderable: false
                        }
                    ]
                });
                $("#vdr_private_questions").css("width", "");
            });
        } else {
            $("#vdr_private_questions_data").html("");
        }
    }).fail(function (err) {
        console.log(err);
    });

    //set up the instructions
    $("#vdr_question_instructions").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
}

function populateManagementTab() {
    //create tab content and structure
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

    //add content to page
    $("#tabs").tabs().find(".ui-tabs-nav").append(tabheader);
    $("#tabs").tabs().append(tabcontent);
    $("#tabs").tabs().tabs("refresh");

    $("#vdr_management_instructions").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    //populate the groups and proponents
    displayWebGroups();
    displayProponents();
}

function createContent() {
    //create tabs
    var html = "<div id=\"tabs\">";

    //tab links
    html += "<ul>";
    html += "<li><a href=\"#tab-1\">Home</a></li>";
    html += "<li><a href=\"#tab-2\">Questions</a></li>";
    html += "</ul>";

    //home tab
    html += "<div id=\"tab-1\" class=\"tabcontent home_tab active\"></div>";

    //question tab
    html += "<div id=\"tab-2\" class=\"tabcontent question_tab\"></div>";

    //add management tab if manage web permissions
    ExecuteOrDelayUntilScriptLoaded(function () {
        var ctx = new SP.ClientContext.get_current();
        var web = ctx.get_web();

        var ob = new SP.BasePermissions();
        ob.set(SP.PermissionKind.manageWeb)

        var per = web.doesUserHavePermissions(ob)
        ctx.executeQueryAsync(function () {
            populateManagementTab();
        },
            function (a, b) {
                window.console && console.log("unable to retrieve user permissions");
            }
        );
    }, "sp.js");

    $("#vdr_container").append(html);

    $(function () {
        $("#tabs").tabs({
            heightStyle: "auto"
        });
    });

    //add home tab content
    populateHomeTab();

    //add question tab content
    populateQuestionTab();
}

$().ready(function () {
    $.when(initateVariables()).then(function () {
        //add the css stylesheet
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

        //confirm user agrees to Terms of Service
        $.when(getTOS()).done(function (acceptance) {
            //user agrees
            writeActivity(acceptance, window.location.href, true);
            createContent();
        }).fail(function (rejection) {
            //user disagrees
            writeActivity(rejection, window.location.href, true);

            //chrome won't allow the dialog to close the parent window "Scripts may close only the windows that were opened by it."
            //but ie will
            window.close();
            window.location = "/_layouts/signout.aspx";
        });
    });
});
