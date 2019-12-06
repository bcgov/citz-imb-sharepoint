//add the js libraries needed for peoplepicker
var head = document.getElementsByTagName("head")[0];

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

function initializePeoplePicker(peoplePickerElementId, group) {
    var schema = {};
    schema['PrincipalAccountType'] = 'User';
    schema['SearchPrincipleSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = false;
    schema['MaximumEntitySuggestions'] = 5;
    schema['Width'] = '250px';
    schema['SharePointGroupID'] = group || null;

    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
}

function SetPickerValue(peoplePickerElementId, loginName) {
    SP.SOD.executeOrDelayUntilScriptLoaded(function () {
        //var loginName = ;
        //var controlName = "SupervisorAccount";
        //var ppDiv = ;         // Select the People Picker DIV
        //var ppEditor = ppDiv.find("[title='" + controlName + "']");  // Use the PP DIV to narrow jQuery scope
        //var spPP = ;           // Get the instance of the People Picker from the Dictionary
        $("#" + peoplePickerElementId + "_TopSpan_EditorInput").val(loginName)            // Set the value
        //console.log("spPP", spPP)
        SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerElementId + "_TopSpan"].AddUnresolvedUserFromEditor(true);
    }, "SP.js");

}

// function SetPickerValue(pickerid, key, dispval) {
//     var xml = '<Entities Append="False" Error="" Separator=";" MaxHeight="3">';
//     xml += '<Entity Key="' + key + '" DisplayText="' + dispval + '" IsResolved="True" Description="' + key + '">';
//     xml += '<MultipleMatches />';
//     xml += '</Entity>';
//     xml += '</Entities>';
//     console.log(xml)
//     SP.SOD.executeFunc('clientpeoplepicker.js', 'SPClientPeoplePicker', function () {
//         EntityEditorCallback(xml, pickerid, true);
//     });

// }

// Get the user ID.
function GetUserID(logonName) {
    var item = {
        'logonName': logonName
    };
    var UserId = $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/ensureuser",
        type: "POST",
        async: false,
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            return data.Id + ';#' + data.Title + ';#';
        },
        error: function (data) {
            failure(data);
        }
    });
    return UserId.responseJSON.d.Id;
}
function getUserIDs(PeoplepickerId) {
    // Get the people picker object from the page.
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];

    if (!peoplePicker.IsEmpty()) {
        if (peoplePicker.HasInputError) return false; // if any error
        else if (!peoplePicker.HasResolvedUsers()) return false; // if any invalid users
        else if (peoplePicker.TotalUserCount > 0) {
            // Get information about all users.
            var users = peoplePicker.GetAllUserInfo();
            var userInfo = '';
            var promise = '';

            if (peoplePicker.AllowMultipleUsers) {
                var UsersID = [];
                for (var i = 0; i < users.length; i++) {
                    UsersID.push(GetUserID(users[i].Key));
                }
                return { "results": UsersID };
            } else {
                return GetUserID(users[0].Key)
            }

        }
    } else {
        if (peoplePicker.AllowMultipleUsers) {
            return { "results": [] };
        } else {
            return null;
        }
    }
}
function getUserAccounts(PeoplepickerId) {
    // Get the people picker object from the page.
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];

    if (!peoplePicker.IsEmpty()) {
        if (peoplePicker.HasInputError) return false; // if any error
        else if (!peoplePicker.HasResolvedUsers()) return false; // if any invalid users
        else if (peoplePicker.TotalUserCount > 0) {
            // Get information about all users.
            var users = peoplePicker.GetAllUserInfo();
            var userInfo = '';
            var promise = '';

            if (peoplePicker.AllowMultipleUsers) {
                var UsersID = [];
                for (var i = 0; i < users.length; i++) {
                    UsersID.push(users[i].Description);
                }
                return { "results": UsersID };
            } else {
                return users[0].Description;
            }

        }
    } else {
        if (peoplePicker.AllowMultipleUsers) {
            return { "results": [] };
        } else {
            return null;
        }
    }
}
function GetUserEmail(logonName) {
    var item = {
        'logonName': logonName
    };
    var UserId = $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/ensureuser",
        type: "POST",
        async: false,
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            console.log("GetUserEmail", data.d.Email)
            return data.d.Email;
        },
        error: function (data) {
            failure(data);
        }
    });
    return UserId.responseJSON.d.Email;
}
function getUserEmails(PeoplepickerId) {
    // Get the people picker object from the page.
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];

    if (!peoplePicker.IsEmpty()) {
        if (peoplePicker.HasInputError) return false; // if any error
        else if (!peoplePicker.HasResolvedUsers()) return false; // if any invalid users
        else if (peoplePicker.TotalUserCount > 0) {
            // Get information about all users.
            var users = peoplePicker.GetAllUserInfo();
            var userInfo = '';
            var promise = '';

            if (peoplePicker.AllowMultipleUsers) {
                var UsersID = [];
                for (var i = 0; i < users.length; i++) {
                    UsersID.push(GetUserEmail(users[i].Key));
                }
                console.log("getUserEmails", UsersID)
                return UsersID;
            } else {
                return GetUserEmail(users[0].Key)
            }

        }
    } else {
        if (peoplePicker.AllowMultipleUsers) {
            return [];
        } else {
            return null;
        }
    }
}
