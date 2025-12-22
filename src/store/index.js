import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice.js";

export const store = configureStore({
    reducer: {
        notifications: notificationsReducer,
    },
});
