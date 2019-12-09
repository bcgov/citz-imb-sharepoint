import React, { Component } from 'react'
import DataTable from '../components/DataTable.js'
import $ from 'jquery'

export class PrivateQuestions extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [
            ],
            buttons: [
                {
                    text: 'Ask a Question',
                    action: function (e, dt, node, config) {
                        alert("Ask a Question");
                    }
                }
            ],
            columns:  [
                {
                    title: "My Questions",
                    data: "Question"
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
            alert('I am the handler')
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


export default PrivateQuestions
