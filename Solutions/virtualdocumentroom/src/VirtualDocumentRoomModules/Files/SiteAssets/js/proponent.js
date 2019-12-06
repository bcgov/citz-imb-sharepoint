function displayProponents() {
    console.log("-- displaying proponents");

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
function activateProponent(ID, UUID) {
    console.log("-- activating proponent");

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
    console.log("-- deactivating proponent");

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
    console.log("-- requesting proponent");

    var addHtml = "<label for='input_proponent'>Enter Proponent Name</label>";
    addHtml += "<input type='text' name='input_proponent' id='input_proponent' class='text ui-widget-content ui-corner-all'>";

    //generate an 8 digit random hexadecimal number and append 'v' to the beginning
    var UUID = 'V' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    var groupName = groupPrefix + UUID;

    $("#vdr_dialog").html(addHtml).dialog({
        dialogClass: "no-close",
        title: "Add a Proponent",
        buttons: [
            {
                text: "Create",
                click: function () {
                    var proponentName = $("#input_proponent").val();
                    if (proponentName === "") {
                        alert("Proponent Name is required.")
                    } else {
                        $.when(
                            createGroup(groupName, groupDescription, ownerGroupID)
                        ).then(function (groupId) {
                            writeActivity("Create Proponent Group", groupName, true);
                            addItemToList("Proponents",
                                {
                                    "Title": proponentName,
                                    "UUID": UUID,
                                    "GroupId": groupId
                                })

                            //add permissions to site
                            $.when(
                                grantGroupPermissionToWeb(groupId, "Read")
                            ).then(function () {
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

function addUserToList(group, user) {
    console.log("-- adding user");

    $.when(getUUID(group)).done(function (UUID) {
        console.log("addUserToList", group, user, UUID);
        $.when(addItemToList('Users', {
            "User": user,
            "QuestionList": UUID + "_Questions"
        })).done(function () {
            writeActivity("added user to List", user, true);
        });
    })
}

function removeUserFromList(userId) {
    console.log("-- removing user");

    console.log("removeUserFromList", arguments);


    $.when(removeItemFromList('Users')).done(function () {
        writeActivity("Remove user from list", userId, true);
    }).fail(function (err) {
        writeActivity("Remove user from list", err, fail);
    });

}

function addUser(groupId) {
    console.log("-- adding user");

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
    console.log("-- removing user");

    $.when(removeUserFromGroup(groupId, userId)).then(function () {
        writeActivity("Remove user", "group: " + groupId + " | user: " + userId, true);
        removeUserFromList(userId);
        displayWebGroups();
    });
}
function displayWebGroups() {
    console.log("-- displaying groups");

    $.when(
        getWebGroups(true)
    ).then(function (data) {
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
