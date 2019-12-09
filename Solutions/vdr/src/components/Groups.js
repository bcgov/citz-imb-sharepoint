import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'
import SimpleModal from './ManageGroups.js'

class Groups extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [{ Member: { Title: "Group Title" } }],
            buttons: [],
            columns: [
                {
                    title: "Group",
                    data: 'Member.Title'
                },
                {
                    title: "",
                    data: null,
                    defaultContent: '<button class="manageGroup">Manage Group</button>'
                }
            ],
            dom: 'Btp'
        }

        //get site groups
        let _this = this;

        $.ajax({
            url: "../_api/web/RoleAssignments?$expand=Member,Member/Users",
            type: "GET",
            async: false,
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        }).done(function (result) {
            _this.state.data = result.d.results
        }).fail(function (err) {
            window.console && console.log(err)
        })
    }

    componentDidMount() {
        //TODO: proper deactivation functionalitiy 
        $(".manageGroup").click(function () {
            const table = $(this).closest('table').DataTable()

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
                <SimpleModal />
            </div>
        )
    }
}

export default Groups