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
        clearNotifications(state) {
            state.items = [];
        },
    },
});

export const { setNotifications, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
