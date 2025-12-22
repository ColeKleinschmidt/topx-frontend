import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        items: [],
    },
    reducers: {
        setNotifications(state, action) {
            state.items = action.payload || [];
        },
        removeNotification(state, action) {
            const idToRemove = action.payload;
            state.items = state.items.filter((notification) => {
                const notificationId = notification?._id || notification?.id || notification?.requestId;
                return notificationId !== idToRemove;
            });
        },
        clearNotifications(state) {
            state.items = [];
        },
    },
});

export const { setNotifications, clearNotifications, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
