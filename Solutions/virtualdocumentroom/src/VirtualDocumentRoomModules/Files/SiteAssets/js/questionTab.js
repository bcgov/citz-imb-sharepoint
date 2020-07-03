function populateQuestionTab() {
    console.log("-- populating question");

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
    html += "<li>any question posted by a proponent to be read only after submission</li>";
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

    //get the private questions
    if (questionList !== undefined) {
        $.when(
            getItems(questionList)
        ).done(function (dataSet) {
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
    }


    // $.ajax({
    //     url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Users')/items?$filter=User eq '" + _spPageContextInfo.userLoginName + "'",
    //     type: "GET",
    //     headers: {
    //         "accept": "application/json;odata=verbose"
    //     }
    // }).done(function (userData) {
    //     console.log(userData)
    //     if (userData.d.results.length > 0) {
    //         $.ajax({
    //             url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +
    //                 userData.d.results[0].QuestionList + "')/items",
    //             type: "GET",
    //             headers: {
    //                 "accept": "application/json;odata=verbose"
    //             }
    //         }).done(function (data) {

    //         });
    //     } else {
    //         $("#vdr_private_questions_data").html("");
    //     }
    // }).fail(function (err) {
    //     console.log(err);
    // });

    //set up the instructions
    $("#vdr_question_instructions").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
}
function askAQuestion() {
    console.log("-- asking question");

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
                var question = $("#input_question").val();

                $.when(
                    addItemToList(questionList, {
                        "Title": question,
                        "Question": question
                    })
                ).done(function () {
                    refreshPrivateQuestions();
                    writeActivity("asked a question", "", true);
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
function refreshPrivateQuestions() {
    //get the private questions
    console.log("-- refreshing private questions")
    if (questionList !== undefined) {
        $.when(
            getItems(questionList)
        ).done(function (dataSet) {
            $("#vdr_private_questions").DataTable().clear().rows.add(dataSet).draw();
        });
    }
}
function createQuestionList(UUID) {
    console.log("-- creating list");

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
