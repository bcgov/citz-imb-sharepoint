import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

export class Groups extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [
                {
                    "__metadata": {
                        "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1119)/Member",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1119)/Member",
                        "type": "SP.Group"
                    },
                    "Owner": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1119)/Member/Owner"
                        }
                    },
                    "Users": {
                        "results": [
                            {
                                "__metadata": {
                                    "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "type": "SP.User"
                                },
                                "Groups": {
                                    "__deferred": {
                                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)/Groups"
                                    }
                                },
                                "Id": 10,
                                "IsHiddenInUI": false,
                                "LoginName": "i:0ǵ.t|bcgovidp|a32d6f859c66450ca4995b0b2bf0a844",
                                "Title": "Toews, Scott D CITZ:EX",
                                "PrincipalType": 1,
                                "Email": "Scott.Toews@gov.bc.ca",
                                "IsShareByEmailGuestUser": false,
                                "IsSiteAdmin": true,
                                "UserId": {
                                    "__metadata": {
                                        "type": "SP.UserIdInfo"
                                    },
                                    "NameId": "a32d6f859c66450ca4995b0b2bf0a844",
                                    "NameIdIssuer": "TrustedProvider:bcgovidp"
                                }
                            }
                        ]
                    },
                    "Id": 1119,
                    "IsHiddenInUI": false,
                    "LoginName": "UAT VICO - Owners",
                    "Title": "UAT VICO - Owners",
                    "PrincipalType": 8,
                    "AllowMembersEditMembership": false,
                    "AllowRequestToJoinLeave": false,
                    "AutoAcceptRequestToJoinLeave": false,
                    "Description": "Use this group to grant people full control permissions to the SharePoint site: VICO",
                    "OnlyAllowMembersViewMembership": false,
                    "OwnerTitle": "UAT VICO - Owners",
                    "RequestToJoinLeaveEmailSetting": null
                },
                {
                    "__metadata": {
                        "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1120)/Member",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1120)/Member",
                        "type": "SP.Group"
                    },
                    "Owner": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1120)/Member/Owner"
                        }
                    },
                    "Users": {
                        "results": [
                            {
                                "__metadata": {
                                    "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "type": "SP.User"
                                },
                                "Groups": {
                                    "__deferred": {
                                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)/Groups"
                                    }
                                },
                                "Id": 10,
                                "IsHiddenInUI": false,
                                "LoginName": "i:0ǵ.t|bcgovidp|a32d6f859c66450ca4995b0b2bf0a844",
                                "Title": "Toews, Scott D CITZ:EX",
                                "PrincipalType": 1,
                                "Email": "Scott.Toews@gov.bc.ca",
                                "IsShareByEmailGuestUser": false,
                                "IsSiteAdmin": true,
                                "UserId": {
                                    "__metadata": {
                                        "type": "SP.UserIdInfo"
                                    },
                                    "NameId": "a32d6f859c66450ca4995b0b2bf0a844",
                                    "NameIdIssuer": "TrustedProvider:bcgovidp"
                                }
                            }
                        ]
                    },
                    "Id": 1120,
                    "IsHiddenInUI": false,
                    "LoginName": "UAT VICO - Members",
                    "Title": "UAT VICO - Members",
                    "PrincipalType": 8,
                    "AllowMembersEditMembership": true,
                    "AllowRequestToJoinLeave": false,
                    "AutoAcceptRequestToJoinLeave": false,
                    "Description": "Use this group to grant people contribute permissions to the SharePoint site: VICO",
                    "OnlyAllowMembersViewMembership": false,
                    "OwnerTitle": "UAT VICO - Owners",
                    "RequestToJoinLeaveEmailSetting": null
                },
                {
                    "__metadata": {
                        "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1121)/Member",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1121)/Member",
                        "type": "SP.Group"
                    },
                    "Owner": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1121)/Member/Owner"
                        }
                    },
                    "Users": {
                        "results": []
                    },
                    "Id": 1121,
                    "IsHiddenInUI": false,
                    "LoginName": "UAT VICO - Visitors",
                    "Title": "UAT VICO - Visitors",
                    "PrincipalType": 8,
                    "AllowMembersEditMembership": false,
                    "AllowRequestToJoinLeave": false,
                    "AutoAcceptRequestToJoinLeave": false,
                    "Description": "Use this group to grant people read permissions to the SharePoint site: VICO",
                    "OnlyAllowMembersViewMembership": false,
                    "OwnerTitle": "UAT VICO - Owners",
                    "RequestToJoinLeaveEmailSetting": null
                },
                {
                    "__metadata": {
                        "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1122)/Member",
                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1122)/Member",
                        "type": "SP.Group"
                    },
                    "Owner": {
                        "__deferred": {
                            "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/RoleAssignments/GetByPrincipalId(1122)/Member/Owner"
                        }
                    },
                    "Users": {
                        "results": [
                            {
                                "__metadata": {
                                    "id": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)",
                                    "type": "SP.User"
                                },
                                "Groups": {
                                    "__deferred": {
                                        "uri": "https://citz.sp.gov.bc.ca/sites/UAT/VICO/_api/Web/GetUserById(10)/Groups"
                                    }
                                },
                                "Id": 10,
                                "IsHiddenInUI": false,
                                "LoginName": "i:0ǵ.t|bcgovidp|a32d6f859c66450ca4995b0b2bf0a844",
                                "Title": "Toews, Scott D CITZ:EX",
                                "PrincipalType": 1,
                                "Email": "Scott.Toews@gov.bc.ca",
                                "IsShareByEmailGuestUser": false,
                                "IsSiteAdmin": true,
                                "UserId": {
                                    "__metadata": {
                                        "type": "SP.UserIdInfo"
                                    },
                                    "NameId": "a32d6f859c66450ca4995b0b2bf0a844",
                                    "NameIdIssuer": "TrustedProvider:bcgovidp"
                                }
                            }
                        ]
                    },
                    "Id": 1122,
                    "IsHiddenInUI": false,
                    "LoginName": "Device Services VICO - VE77078",
                    "Title": "Device Services VICO - VE77078",
                    "PrincipalType": 8,
                    "AllowMembersEditMembership": false,
                    "AllowRequestToJoinLeave": false,
                    "AutoAcceptRequestToJoinLeave": false,
                    "Description": "created by automation",
                    "OnlyAllowMembersViewMembership": true,
                    "OwnerTitle": "UAT VICO - Owners",
                    "RequestToJoinLeaveEmailSetting": null
                },
            ],
            buttons: [],
            columns: [
                {
                    title: "Group",
                    data: 'Title'
                },
                {
                    title: "",
                    data: null,
                    defaultContent: '<button class="manageGroup">Manage Group</button>'
                }
            ],
            dom: 'Btp'
        }
    }
    componentDidMount(){
        //TODO: proper deactivation functionalitiy 
        $(".manageGroup").click(function(){
            const table = $(this).closest('table').DataTable()

            console.log(table.row().data())
            alert('I am the Group handler')
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

export default Groups
