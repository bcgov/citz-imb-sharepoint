function getUUID(groupId) {
    console.log("-- getting UUID");

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
        } else {
            defer.reject();
        }

    }).fail(function (err) {
        console.log(err);
        defer.reject();
    });

    return defer.promise();
}

function writeActivity(action, info, success) {
    //console.log("-- writing activity");

    $.when(
        addItemToList('ActivityLog', {
            "Title": action,
            "Notes": info.toString(),
            "Success": success,
            "User": currentUser
        })).done(function () {
            console.log("wrote activity:", "", action, info, success, currentUser);
        });
}


function createContributionLibrary(UUID) {
    console.log("-- creating library");

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
