import "../css/SearchResults.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchListAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nextQuery = params.get("q") || "";
        setQuery(nextQuery);

        if (!nextQuery.trim()) {
            setResults([]);
            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        searchListAPI(nextQuery)
            .then((response) => {
                setResults(response?.lists || []);
            })
            .catch(() => {
                setError("Unable to load search results right now.");
                setResults([]);
            })
            .finally(() => setLoading(false));
    }, [location.search]);

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
    };

    const noResults = useMemo(
        () => !loading && query.trim() && results.length === 0 && !error,
        [error, loading, query, results.length]
    );

    return (
        <div className="search-results-container">
            <div className="search-results-top-bar">
                <h2 className="search-results-header">
                    Search Results{query ? ` for "${query}"` : ""}
                </h2>
            </div>
            <div className="lists">
                {results.map((list, index) => (
                    <List
                        key={list._id || list.id || index}
                        list={list}
                        onClick={() => handleOpenList(list._id || list.id, list.userId || list.ownerId)}
                    />
                ))}
            </div>
            {loading && <h2 className="loading-lists">Loading...</h2>}
            {noResults && <p className="no-results">No results found.</p>}
            {error && <p className="no-results">{error}</p>}
        </div>
    );
};

export default SearchResults;
