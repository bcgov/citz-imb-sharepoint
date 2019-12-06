import React, { Component } from 'react'
import $ from 'jquery'

class DataTable extends Component {
    componentDidMount() {
        this.$el = $(this.el)

        this.$el.DataTable({
            data: this.props.data,
            dom: this.props.dom,
            buttons: this.props.buttons,
            columns: this.props.columns
        })
    }

    componentWillUnmount() {
        this.$el.DataTable.destroy(true)
    }

    render() {
        return (
            <table ref={el => this.el = el}>
            </table>
        )
    }
}

export default DataTable
