import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import setUpReducer from "./setUp/setUpSlice";
import teacherReducer from "./teacher/teacherSlice";
import adminReducer from "./admin/adminSlice";
import studentReducer from "./student/studentSlice";
import superAdminReducer from "./superAdmin/superAdminSlice";
import lessonGeneratorReducer from "./lessonGenerator/lessonGeneratorSlice";
import { paraApi } from "./api";
import { uniApi } from "./api/uniBaseApi";
import { superAdminApi } from "./api/superAdminBaseApi";

export const store = configureStore({
  reducer: {
    user: userReducer,
    setUp: setUpReducer,
    teacher: teacherReducer,
    admin: adminReducer,
    student: studentReducer,
    superAdmin: superAdminReducer,
    lessonGenerator: lessonGeneratorReducer,
    [paraApi.reducerPath]: paraApi.reducer,
    [uniApi.reducerPath]: uniApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      paraApi.middleware,
      uniApi.middleware,
      superAdminApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
