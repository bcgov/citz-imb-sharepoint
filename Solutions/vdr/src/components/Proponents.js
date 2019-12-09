import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

class Proponents extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            buttons: [
                {
                    text: 'Add a Proponent',
                    action: function (e, dt, node, config) {
                        alert("add a proponent");
                    }
                }
            ],
            columns: [
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
        //get proponent list data
        let _this = this;

        $.ajax({
            url: "../_api/web/lists/getByTitle('Proponents')/items",
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
        $(".proponentDeactivate").click(function () {
            const table = $(this).closest('table').DataTable()

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