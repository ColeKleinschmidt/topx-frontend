import "../css/ListDetail.css";
import { useCallback, useEffect, useState } from "react";
import NavigationBar from "../../components/class/NavigationBar.jsx";
import List from "../../components/class/List.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { getAllNotificationsAPI, getListAPI } from "../../backend/apis.js";

const ListDetail = () => {
    const { listId } = useParams();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleNavigate = (targetPage) => {
        setPage(targetPage);
        navigate(`/${targetPage}`);
    };

    const refreshNotifications = useCallback(async () => {
        try {
            const response = await getAllNotificationsAPI();
            if (response?.notifications) {
                dispatch(setNotifications(response.notifications));
            }
        } catch (err) {
            console.error("Failed to refresh notifications", err);
        }
    }, [dispatch]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getListAPI(listId);
                const listData = response?.list || response?.data || response;
                const items = listData?.items || listData?.listItems || [];
                setList({
                    title: listData?.title || listData?.name || "Untitled list",
                    items,
                });
            } catch (err) {
                console.error("Failed to load list", err);
                setError("Unable to load this list right now.");
            } finally {
                setLoading(false);
            }
        };

        if (listId) {
            fetchList();
        }
    }, [listId]);

    return (
        <div className="home-container">
            <NavigationBar setPage={handleNavigate} page={page} onNotificationsUpdated={refreshNotifications} />
            <div className="home-content list-detail-content">
                {loading && <p className="list-detail-status">Loading list...</p>}
                {error && !loading && <p className="list-detail-status error">{error}</p>}
                {!loading && !error && list && (
                    <div className="list-detail-wrapper">
                        <h2 className="list-detail-title">{list.title}</h2>
                        <List list={list} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListDetail;
