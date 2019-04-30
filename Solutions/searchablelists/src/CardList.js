import React from 'react';
import Card from './Card.js';

class CardList extends React.Component {
    render() {
        return (
            <div className="row">
                    {this.props.items.map(item => <Card{...item} />)}
            </div>
        )
    }
}

export default CardList;