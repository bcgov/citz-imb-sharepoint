import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

export class Proponents extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [
                {
                    "__metadata": {
                        "id": "4d613d0d-8768-48b5-b52f-0afebcf14dc5",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)",
                        "etag": "\"1\"",
                        "type": "SP.Data.ProponentsListItem"
                    },
                    "FirstUniqueAncestorSecurableObject": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FirstUniqueAncestorSecurableObject"
                        }
                    },
                    "RoleAssignments": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/RoleAssignments"
                        }
                    },
                    "AttachmentFiles": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/AttachmentFiles"
                        }
                    },
                    "ContentType": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/ContentType"
                        }
                    },
                    "GetDlpPolicyTip": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/GetDlpPolicyTip"
                        }
                    },
                    "FieldValuesAsHtml": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesAsHtml"
                        }
                    },
                    "FieldValuesAsText": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesAsText"
                        }
                    },
                    "FieldValuesForEdit": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesForEdit"
                        }
                    },
                    "File": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/File"
                        }
                    },
                    "Folder": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/Folder"
                        }
                    },
                    "ParentList": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/ParentList"
                        }
                    },
                    "FileSystemObjectType": 0,
                    "Id": 1,
                    "ID": 1,
                    "ContentTypeId": "0x0100ADCCD835D23C8D47A131AB462A513B1A",
                    "Title": "test",
                    "Modified": "2019-08-29T21:19:05Z",
                    "Created": "2019-08-29T21:19:05Z",
                    "AuthorId": 10,
                    "EditorId": 10,
                    "OData__UIVersionString": "1.0",
                    "Attachments": false,
                    "GUID": "b658b757-3954-4b43-8a21-e51c2809d5a4",
                    "UUID": "VE77078",
                    "Active": true,
                    "GroupId": 1122
                },
                {
                    "__metadata": {
                        "id": "4d613d0d-8768-48b5-b52f-0afebcf14dc5",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)",
                        "etag": "\"1\"",
                        "type": "SP.Data.ProponentsListItem"
                    },
                    "FirstUniqueAncestorSecurableObject": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FirstUniqueAncestorSecurableObject"
                        }
                    },
                    "RoleAssignments": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/RoleAssignments"
                        }
                    },
                    "AttachmentFiles": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/AttachmentFiles"
                        }
                    },
                    "ContentType": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/ContentType"
                        }
                    },
                    "GetDlpPolicyTip": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/GetDlpPolicyTip"
                        }
                    },
                    "FieldValuesAsHtml": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesAsHtml"
                        }
                    },
                    "FieldValuesAsText": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesAsText"
                        }
                    },
                    "FieldValuesForEdit": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/FieldValuesForEdit"
                        }
                    },
                    "File": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/File"
                        }
                    },
                    "Folder": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/Folder"
                        }
                    },
                    "ParentList": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/Lists(guid'4aa3c99c-2738-4ac1-a593-460e918671c8')/Items(1)/ParentList"
                        }
                    },
                    "FileSystemObjectType": 0,
                    "Id": 2,
                    "ID": 2,
                    "ContentTypeId": "0x0100ADCCD835D23C8D47A131AB462A513B1A",
                    "Title": "test 2",
                    "Modified": "2019-08-29T21:19:05Z",
                    "Created": "2019-08-29T21:19:05Z",
                    "AuthorId": 10,
                    "EditorId": 10,
                    "OData__UIVersionString": "1.0",
                    "Attachments": false,
                    "GUID": "b658b757-3954-4b43-8a21-e51c2809d5a4",
                    "UUID": "VFFFFFF",
                    "Active": true,
                    "GroupId": 1122
                }
            ],
            buttons: [
                {
                    text: 'Add a Proponent',
                    action: function (e, dt, node, config) {
                        alert("add a proponent");
                    }
                }
            ],
            columns:  [
                {
                    title: "Proponent",
                    data: "Title"
                },
                {
                    title: "Unique ID",
                    data: "UUID"
                },
                {
                    title: "",
                    data: null,
                    defaultContent: '<button class="proponentDeactivate">Deactivate</button>'
                }
            ],
            dom: 'tBp'
        }
    }
    componentDidMount(){
        //TODO: proper deactivation functionalitiy 
        $(".proponentDeactivate").click(function(){
            const table = $(this).closest('table').DataTable()

            console.log(table.row().data())
            alert('I am the Proponent handler')
        })
    }

    render() {
        return (
            <div>
                <DataTable 
                data={this.state.data}
                buttons={this.state.buttons}
                columns={this.state.columns}
                dom={this.state.dom}
                ></DataTable>
            </div>

        )
    }
}

export default Proponents
