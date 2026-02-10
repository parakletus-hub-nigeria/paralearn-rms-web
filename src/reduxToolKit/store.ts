import {configureStore} from '@reduxjs/toolkit';
import userReducer from "./user/userSlice";
import setUpReducer from './setUp/setUpSlice';
import teacherReducer from "./teacher/teacherSlice";
import adminReducer from "./admin/adminSlice";
import { paraApi } from "./api";

export const store = configureStore({
    reducer: {
        user: userReducer,
        setUp: setUpReducer,
        teacher: teacherReducer,
        admin: adminReducer,
        [paraApi.reducerPath]: paraApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(paraApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;