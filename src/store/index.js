import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice.js";
import blockedUsersReducer from "./blockedUsersSlice.js";

export const store = configureStore({
    reducer: {
        notifications: notificationsReducer,
        blockedUsers: blockedUsersReducer,
    },
});
