import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApiWithAuth } from '../api/baseApi';
import { orderApi } from '../api/orderApi';

// For auth state, we might want to keep using the existing system or migrate it.
// For now, let's just add the RTK Query API.

export const store = configureStore({
  reducer: {
    [baseApiWithAuth.reducerPath]: baseApiWithAuth.reducer,
    // Add auth reducer here if you want to migrate auth to Redux
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApiWithAuth.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
