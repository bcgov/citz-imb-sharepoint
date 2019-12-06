import React, { Component } from 'react'

class Terms extends Component {
    constructor() {
        super()
        this.state = {
            message: 'Do not steal stuff'
        }
    }

    changeMessage() {
        this.setState({
            message: 'thanks for not stealing'
        })
    }

    render() {
        return (
            <div>
                <h1>{this.state.message}</h1>
                <button onClick={() => this.changeMessage()}>Change Message</button>
            </div>
        )
    }
}

export default Terms