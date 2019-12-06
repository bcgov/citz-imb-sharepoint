import React from 'react'

const Tab = (props) => {
    console.log(props)
    return (
        <div className='fred'>
            <h1>{props.name}</h1>
        </div>
    )
}

export default Tab