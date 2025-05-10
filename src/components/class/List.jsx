import "../css/List.css";

const List = ({ list }) => {

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
            <h2 className="list-name">{list.title}</h2>
            <div className = "separator">
                <div className = "line" />
                <div className = "dot" />
                <div className = "line" />
            </div>
            {list.items.map((item, index) => (
                <RowItem key={index} item={item} number={index+1} />
            ))}

        </div>
    )
}

export default List;