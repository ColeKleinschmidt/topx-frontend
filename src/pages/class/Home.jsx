import "../css/Home.css";
import { useEffect, useRef, useState } from "react";
import NavigationBar from "../../components/class/NavigationBar.jsx";
import { authStatusAPI, findItemsAPI } from "../../backend/apis.js";
import { useNavigate } from 'react-router-dom';
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const [itemsList, setItemsList] = useState([{ title: "", image: "" }]);
    const [itemSuggestions, setItemSuggestions] = useState([[]]);
    const debounceTimers = useRef({});

    const navigate = useNavigate();

    const newList = () => {

    }

    // useEffect(() => {
    //     authStatusAPI().then((response) => {
    //         if (!response.authenticated) {
    //             navigate("/");
    //         }
    //     })
    // },[]);
    
    const handleTitleChange = (event) => {
        setListTitle(event.target.value);
    }

    const clearAllTimers = () => {
        Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
        debounceTimers.current = {};
    }

    const resetNewList = () => {
        clearAllTimers();
        setListTitle("");
        setItemsList([{ title: "", image: "" }]);
        setItemSuggestions([[]]);
    }

    useEffect(() => {
        if (showNewList) {
            resetNewList();
        }
    }, [showNewList]);

    useEffect(() => {
        return () => {
            clearAllTimers();
        }
    }, []);

    const handleItemInputChange = (index, value) => {
        const updatedItems = [...itemsList];
        updatedItems[index] = { ...updatedItems[index], title: value };
        setItemsList(updatedItems);

        if (debounceTimers.current[index]) {
            clearTimeout(debounceTimers.current[index]);
        }

        if (value.trim() === "") {
            setItemSuggestions((prevSuggestions) => {
                const next = [...prevSuggestions];
                next[index] = [];
                return next;
            });
            return;
        }

        debounceTimers.current[index] = setTimeout(async () => {
            const response = await findItemsAPI(value);
            setItemSuggestions((prevSuggestions) => {
                const next = [...prevSuggestions];
                next[index] = response.items || [];
                return next;
            });
        }, 2000);
    }

    const handleSuggestionSelect = (index, item) => {
        const updatedItems = [...itemsList];
        const title = item.title || item.name || updatedItems[index].title;
        updatedItems[index] = { title: title, image: item.image || "" };
        setItemsList(updatedItems);
        setItemSuggestions((prevSuggestions) => {
            const next = [...prevSuggestions];
            next[index] = [];
            return next;
        });
    }

    const addNewItem = () => {
        if (itemsList.length >= 10) return;
        setItemsList((prevItems) => [...prevItems, { title: "", image: "" }]);
        setItemSuggestions((prevSuggestions) => [...prevSuggestions, []]);
    }

    const removeItem = (index) => {
        if (itemsList.length === 1) return;
        clearAllTimers();
        setItemsList((prevItems) => prevItems.filter((_, itemIndex) => itemIndex !== index));
        setItemSuggestions((prevSuggestions) => prevSuggestions.filter((_, itemIndex) => itemIndex !== index));
    }

    const createListReady = itemsList.length >= 10;

    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page}/>
            <div className="home-content">
                {page === "myLists" ? (
                    <MyLists />
                ) : page === "friendsLists" ? (
                    <FriendsLists />
                ) : page === "profile" && (
                    <Profile />
                )}
                <div className={`newList ${showNewList ? "active" : ""}`} onClick={() => {setShowNewList(!showNewList)}}>+</div>
                <div className="newListContainerWrapper">
                    <div className={`newListContainer ${showNewList && "animate"}`}>
                        <div className="new-list-content">
                            <div className="new-list-title-section">
                                <input
                                    className="new-list-title"
                                    placeholder="List title"
                                    value={listTitle}
                                    onChange={handleTitleChange}
                                    maxLength={25}
                                />
                                <div className="separator">
                                    <div className="line" />
                                    <div className="dot" />
                                    <div className="line" />
                                </div>
                            </div>
                            <div className="new-list-items">
                                {itemsList.map((item, index) => (
                                    <div className="editable-row" key={index}>
                                        <div className="row-number">
                                            <h1>{index + 1}</h1>
                                        </div>
                                        <div className="item-input-wrapper">
                                            <input
                                                className="item-input"
                                                placeholder="Type to search items"
                                                value={item.title}
                                                onChange={(event) => handleItemInputChange(index, event.target.value)}
                                            />
                                            {itemSuggestions[index] && itemSuggestions[index].length > 0 && (
                                                <div className="suggestions-dropdown">
                                                    {itemSuggestions[index].map((suggestion, suggestionIndex) => (
                                                        <div
                                                            key={suggestionIndex}
                                                            className="suggestion-item"
                                                            onClick={() => handleSuggestionSelect(index, suggestion)}
                                                        >
                                                            <span>{suggestion.title || suggestion.name || "Item"}</span>
                                                            {suggestion.image && (
                                                                <img src={suggestion.image} alt={suggestion.title || suggestion.name || "Item"} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-image-preview">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title || "Selected item"} />
                                            ) : (
                                                <div className="image-placeholder">No image</div>
                                            )}
                                        </div>
                                        <button className="remove-item" onClick={() => removeItem(index)} disabled={itemsList.length === 1}>x</button>
                                    </div>
                                ))}
                                <div className="new-list-actions">
                                    <button className="add-item" onClick={addNewItem} disabled={itemsList.length >= 10}>
                                        Add Item
                                    </button>
                                    <button className={`create-list ${createListReady ? "ready" : ""}`} disabled={!createListReady}>
                                        Create List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;