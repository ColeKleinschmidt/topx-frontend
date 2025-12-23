import "../css/List.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { findItemsAPI } from "../../backend/apis.js";

const List = ({ list, setList, editable = false, onClick }) => {

    const [newList, setNewList] = useState({ title: "", listItems: [{ title: "", image: "" }] });
    const [searchResults, setSearchResults] = useState({});
    const containerRef = useRef(null);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isSearching, setIsSearching] = useState({});
    const searchTimeouts = useRef({});
    const inputRefs = useRef([]);
    const [activeInputIndex, setActiveInputIndex] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const hydratedListIdRef = useRef(null);

    const isTitleValid = newList.title.trim().length > 0 && newList.title.trim().length <= 25;
    const normalizeItems = useCallback((items) => {
        if (!Array.isArray(items) || items.length === 0) {
            return [{ title: "", image: "" }];
        }
        return items.map((item) => ({
            title: item?.title || item?.name || "",
            image: item?.image || item?.img || item?.url || "",
        }));
    }, []);

    useEffect(() => {
        if (!editable) {
            hydratedListIdRef.current = null;
            return;
        }
        if (!list) return;

        const incomingId = list?._id || list?.id || list?.listId || "editable-list";
        const normalizedItems = normalizeItems(list.items || list.listItems);
        const normalizedTitle = list.title || list.name || "";
        const shouldHydrate = hydratedListIdRef.current !== incomingId;

        if (shouldHydrate) {
            setNewList({ title: normalizedTitle, listItems: normalizedItems });
            hydratedListIdRef.current = incomingId;
        }
    }, [editable, list, normalizeItems]);

    const reorderIndexMap = (map, from, to) => {
        const keys = Object.keys(map);
        if (keys.length === 0) return map;
        const maxIndex = Math.max(...keys.map((key) => Number(key)), 0);
        const ordered = Array.from({ length: maxIndex + 1 }, (_, idx) => map[idx]);
        if (from < 0 || to < 0 || from >= ordered.length || to >= ordered.length) {
            return map;
        }
        const [moved] = ordered.splice(from, 1);
        ordered.splice(to, 0, moved);
        const result = {};
        ordered.forEach((value, idx) => {
            if (value !== undefined) {
                result[idx] = value;
            }
        });
        return result;
    };

    const shiftIndexMapAfterRemoval = (map, removedIndex) => {
        const result = {};
        Object.keys(map).forEach((key) => {
            const numericKey = Number(key);
            if (numericKey < removedIndex) {
                result[numericKey] = map[numericKey];
            } else if (numericKey > removedIndex) {
                result[numericKey - 1] = map[numericKey];
            }
        });
        return result;
    };

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
    }, [newList.listItems, activeInputIndex]);

    const handleItemTitleChange = (index, value) => {
        setNewList((prev) => {
            // When user manually types, clear any selected image to allow searching again
            const updatedItems = prev.listItems.map((item, i) => i === index ? { ...item, title: value, image: "" } : item);
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

    const canAddNewItem = () => {
        if (newList.listItems.length === 0) return true;
        const last = newList.listItems[newList.listItems.length - 1];
        // Require that the last item is a selected suggestion (has an image)
        return Boolean(last && last.image);
    };

    const handleAddItem = () => {
        if (!canAddNewItem()) return;
        setNewList((prev) => {
            if (prev.listItems.length >= 10) return prev; // protect again inside callback
            const next = { ...prev, listItems: [...prev.listItems, { title: "", image: "" }] };
            setActiveInputIndex(prev.listItems.length);
            return next;
        });
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
        setSearchResults((prev) => shiftIndexMapAfterRemoval(prev, index));
        setIsSearching((prev) => shiftIndexMapAfterRemoval(prev, index));
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleReorderItems = (fromIndex, toIndex) => {
        setNewList((prev) => {
            if (!prev.listItems || prev.listItems.length === 0) return prev;
            if (fromIndex === toIndex) return prev;
            if (
                fromIndex < 0 ||
                toIndex < 0 ||
                fromIndex >= prev.listItems.length ||
                toIndex >= prev.listItems.length
            ) {
                return prev;
            }
            const items = [...prev.listItems];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            return { ...prev, listItems: items };
        });
        setSearchResults((prev) => reorderIndexMap(prev, fromIndex, toIndex));
        setIsSearching((prev) => reorderIndexMap(prev, fromIndex, toIndex));
        setActiveInputIndex((prevIndex) => {
            if (prevIndex === null) return prevIndex;
            if (prevIndex === fromIndex) return toIndex;
            if (fromIndex < toIndex && prevIndex > fromIndex && prevIndex <= toIndex) return prevIndex - 1;
            if (fromIndex > toIndex && prevIndex < fromIndex && prevIndex >= toIndex) return prevIndex + 1;
            return prevIndex;
        });
    };

    const handleDragStart = (event, index) => {
        if (event?.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            // Some browsers require data to begin a drag operation
            event.dataTransfer.setData("text/plain", String(index));
        }
        setDragIndex(index);
        setDragOverIndex(index);
    };

    const handleDragOver = (event, index) => {
        event.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (event, index) => {
        event.preventDefault();
        if (dragIndex === null) return;
        if (dragIndex !== index) {
            handleReorderItems(dragIndex, index);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const RowItem = ({ number, item, index }) => {
        const rowClasses = [
            "row-item",
            editable ? "editable" : "",
            dragIndex === index ? "dragging" : "",
            dragOverIndex === index ? "drag-over" : "",
        ].filter(Boolean).join(" ");

        if (!editable) {
            return (
                <div className={rowClasses}>
                    <div className="row-number">
                        <h1>{number}</h1>
                    </div>
                    <h2 className="item-title">{item.title}</h2>
                    <img className="item-image" src={item.image} alt={item.title} />
                </div>
            );
        }

        return (
            <div
                className={rowClasses}
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={(event) => handleDrop(event, index)}
                onDragEnter={() => setDragOverIndex(index)}
                onDragLeave={() => setDragOverIndex(null)}
                onDragEnd={handleDragEnd}
            >
                <button
                    type="button"
                    className="drag-handle"
                    aria-label="Reorder item"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.preventDefault()}
                >
                    <span className="drag-dots" aria-hidden="true">⋮⋮</span>
                </button>
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
                    {(!item.image && (isSearching[index] || (searchResults[index]?.length > 0) || (item.title.trim() && !isSearching[index] && (searchResults[index]?.length === 0)))) && (
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

    useEffect(() => {
        const current = containerRef.current;
        if (!current || !editable) {
            setIsScrollable(false);
            return undefined;
        }

        const checkScrollable = () => {
            setIsScrollable(current.scrollHeight > current.clientHeight);
        };

        // Use ResizeObserver to check when content size changes
        const ro = new ResizeObserver(checkScrollable);
        ro.observe(current);

        // Also check on window resize
        window.addEventListener("resize", checkScrollable);
        // initial check
        checkScrollable();

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", checkScrollable);
        };
    }, [newList, list, editable]);

    const containerClasses = [
        "list-container",
        editable ? "editable" : "view-only",
        isScrollable ? "scrollable" : "",
        !editable && onClick ? "clickable" : "",
    ].filter(Boolean).join(" ");

    const handleKeyDown = (event) => {
        if (!editable && onClick && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            ref={containerRef}
            className={containerClasses}
            onClick={!editable ? onClick : undefined}
            role={!editable && onClick ? "button" : undefined}
            tabIndex={!editable && onClick ? 0 : undefined}
            onKeyDown={handleKeyDown}
        >
            {editable ? (
                <input
                    value={newList.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    onFocus={() => setActiveInputIndex(null)}
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
                    <button
                        type="button"
                        className="add-item"
                        onClick={handleAddItem}
                        disabled={!canAddNewItem() || newList.listItems.length >= 10}
                        title={!canAddNewItem() ? "Select a suggestion to enable adding another item" : ""}
                    >
                        + Add item
                    </button>
                    {newList.listItems.length >= 10 && (
                        <p className="input-hint">Maximum of 10 items reached.</p>
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
