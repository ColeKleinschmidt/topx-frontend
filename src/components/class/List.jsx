import "../css/List.css";
import { useEffect, useRef, useState } from "react";
import { findItemsAPI } from "../../backend/apis.js";

const List = ({ list, setList, editable = false }) => {

    const [newList, setNewList] = useState({ title: "", listItems: [{ title: "", image: "" }] });
    const [searchResults, setSearchResults] = useState({});
    const [isSearching, setIsSearching] = useState({});
    const searchTimeouts = useRef({});
    const inputRefs = useRef([]);
    const [activeInputIndex, setActiveInputIndex] = useState(null);

    const isTitleValid = newList.title.trim().length > 0 && newList.title.trim().length <= 25;

    useEffect(() => {
        if (setList) {
            setList(newList);
        }
    }, [newList, setList]);

    useEffect(() => {
        if (!editable || newList.listItems.length === 0) return;
        const lastIndex = newList.listItems.length - 1;
        const targetIndex = newList.listItems[lastIndex].title === "" ? lastIndex : 0;
        const targetInput = inputRefs.current[targetIndex];
        if (targetInput) {
            targetInput.focus();
        }
    }, [newList.listItems.length, editable]);

    const handleTitleChange = (value) => {
        setNewList((prev) => ({ ...prev, title: value.slice(0, 25) }));
    };

    useEffect(() => {
        if (activeInputIndex === null) return;
        const activeInput = inputRefs.current[activeInputIndex];
        if (activeInput) {
            const caretPosition = activeInput.value.length;
            activeInput.focus();
            activeInput.setSelectionRange(caretPosition, caretPosition);
        }
    }, [newList, activeInputIndex]);

    const handleItemTitleChange = (index, value) => {
        setNewList((prev) => {
            const updatedItems = prev.listItems.map((item, i) => i === index ? { ...item, title: value } : item);
            return { ...prev, listItems: updatedItems };
        });

        setActiveInputIndex(index);

        if (searchTimeouts.current[index]) {
            clearTimeout(searchTimeouts.current[index]);
        }

        if (!value.trim()) {
            setIsSearching((prev) => ({ ...prev, [index]: false }));
            setSearchResults((prev) => ({ ...prev, [index]: [] }));
            return;
        }

        searchTimeouts.current[index] = setTimeout(async () => {
            setIsSearching((prev) => ({ ...prev, [index]: true }));
            try {
                const response = await findItemsAPI(value);
                setSearchResults((prev) => ({ ...prev, [index]: response?.items || [] }));
            } catch (error) {
                console.error("Error fetching items", error);
                setSearchResults((prev) => ({ ...prev, [index]: [] }));
            } finally {
                setIsSearching((prev) => ({ ...prev, [index]: false }));
            }
        }, 2000);
    };

    const handleSelectSuggestion = (index, suggestion) => {
        setNewList((prev) => {
            const updatedItems = prev.listItems.map((item, i) => i === index ? { ...suggestion } : item);
            return { ...prev, listItems: updatedItems };
        });
        setSearchResults((prev) => ({ ...prev, [index]: [] }));
        setIsSearching((prev) => ({ ...prev, [index]: false }));
    };

    const handleAddItem = () => {
        if (newList.listItems.length >= 10) return;
        setNewList((prev) => ({ ...prev, listItems: [...prev.listItems, { title: "", image: "" }] }));
        setActiveInputIndex(newList.listItems.length);
    };

    const handleRemoveItem = (index) => {
        setNewList((prev) => {
            const updatedItems = prev.listItems.filter((_, i) => i !== index);
            const normalizedItems = updatedItems.length === 0 ? [{ title: "", image: "" }] : updatedItems;
            setActiveInputIndex((prevIndex) => {
                if (prevIndex === null) return prevIndex;
                const maxIndex = normalizedItems.length - 1;
                return Math.min(prevIndex, maxIndex);
            });
            return { ...prev, listItems: normalizedItems };
        });
        setSearchResults((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const RowItem = ({ number, item, index }) => {
        if (!editable) {
            return (
                <div className="row-item">
                    <div className="row-number">
                        <h1>{number}</h1>
                    </div>
                    <h2 className="item-title">{item.title}</h2>
                    <img className="item-image" src={item.image} alt={item.title} />
                </div>
            );
        }

        return (
            <div className="row-item editable">
                <div className="row-number">
                    <h1>{number}</h1>
                </div>
                <div className="item-editor">
                    <input
                        ref={(el) => { inputRefs.current[index] = el; }}
                        value={item.title}
                        onChange={(event) => handleItemTitleChange(index, event.target.value)}
                        onFocus={() => setActiveInputIndex(index)}
                        placeholder="Item title"
                        className="item-input"
                    />
                    {(isSearching[index] || (searchResults[index]?.length > 0) || (item.title.trim() && !isSearching[index] && (searchResults[index]?.length === 0))) && (
                        <div className="search-dropdown">
                            {isSearching[index] && <div className="search-status">Searching...</div>}
                            {!isSearching[index] && searchResults[index]?.length === 0 && item.title.trim() && (
                                <div className="search-status">No matches found</div>
                            )}
                            {searchResults[index]?.map((suggestion) => (
                                <button
                                    type="button"
                                    key={suggestion._id}
                                    className="dropdown-option"
                                    onClick={() => handleSelectSuggestion(index, suggestion)}
                                >
                                    <span className="option-avatar">
                                        <img src={suggestion.image} alt={suggestion.title} />
                                    </span>
                                    <span className="option-title">{suggestion.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="item-image preview">
                    {item.image ? (
                        <img src={item.image} alt={item.title || `Item ${number}`} />
                    ) : (
                        <div className="placeholder-image" />
                    )}
                    <button className="remove-item" type="button" onClick={() => handleRemoveItem(index)}>×</button>
                </div>
            </div>
        );
    };

    return (
        <div className="list-container">
            {editable ? (
                <input
                    value={newList.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Title"
                    className="list-name input"
                />
            ) : (
                <h2 className="list-name">{list.title}</h2>
            )}
            <div className="separator">
                <div className="line" />
                <div className="dot" />
                <div className="line" />
            </div>
            {!editable && list.items.map((item, index) => (
                <RowItem key={index} item={item} number={index + 1} />
            ))}
            {editable && newList.listItems.map((item, index) => (
                <RowItem key={index} item={item} index={index} number={index + 1} />
            ))}
            {editable && (
                <div className="list-actions">
                    {newList.listItems.length < 10 ? (
                        <button type="button" className="add-item" onClick={handleAddItem}>+ Add item</button>
                    ) : (
                        <button type="button" className={`submit-list ${isTitleValid ? "active" : ""}`} disabled={!isTitleValid}>Submit</button>
                    )}
                    {!isTitleValid && (
                        <p className="input-hint">Title must be 1-25 characters</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default List;