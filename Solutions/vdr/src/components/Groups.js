import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import DataTable from '../components/DataTable.js'

export class Groups extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            buttons: [],
            columns: [
                {
                    title: "Group",
                    data: null
                },
                {
                    title: "User",
                    data: null
                },
                {
                    title: "",
                    data: null,
                    defaultContent: "some sort of button"
                }
            ],
            dom: 'Btp'
        }
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
