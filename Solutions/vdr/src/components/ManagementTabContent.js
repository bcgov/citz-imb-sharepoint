import React from 'react'
import Proponents from './Proponents'
import Groups from './Groups'

function ManagementTabContent() {
    return (
        <div>
            <h2>Site Management</h2>
            <div className='row'>
                <div className='column'>
                    <Proponents />
                </div>

                <div className='column'>
                    <Groups />
                </div>
            </div>
        </div>
    )
}

export default ManagementTabContent