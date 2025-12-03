import "../css/List.css";
import { useState } from "react";

const List = ({ list, setList, editable = false }) => {

    const [newList, setNewList] = useState({title: "", listItems: []})

    const RowItem = ({ number, item }) => {
        return (
            <div className="row-item">
                <div className="row-number">
                    <h1>{number}</h1>
                </div>
                <h2 className="item-title">{item.title}</h2>
                <img className="item-image" src={item.image} alt={item.title} />
            </div>
        )
    }

    return (
        <div className="list-container">
            {editable ? (
                <input onChange={(x) => {setNewList({...newList, title: x.target.value})}} placeholder="Title" className="list-name" />
            ) : (
                <h2 className="list-name">{list.title}</h2>
            )}
            <div className = "separator">
                <div className = "line" />
                <div className = "dot" />
                <div className = "line" />
            </div>
            {!editable && list.items.map((item, index) => (
                <RowItem key={index} item={item} number={index+1} />
            ))}
            {editable && newList.listItems.map((item, index) => (
                <RowItem key={index} item={item} number={index+1} />
            ))}

        </div>
    )
}

export default List;