import jwtDecode from 'jwt-decode';

import update from '#rsu/immutable-update';

import createReducerWithMap from '#utils/createReducerWithMap';
import schema from '#schema';
import initialAuthState from '../initial-state/auth';


// TYPE

export const LOGIN_ACTION = 'auth/LOGIN';
export const LOGOUT_ACTION = 'auth/LOGOUT';
export const AUTHENTICATE_ACTION = 'auth/AUTHENTICATE_ACTION';
export const SET_ACCESS_TOKEN_ACTION = 'auth/SET_ACCESS_TOKEN';
export const SET_USER_PREFERENCES = 'auth/SET_USER_PREFERENCES';

// ACTION-CREATOR

export const loginAction = ({ access, refresh }) => ({
    type: LOGIN_ACTION,
    access,
    refresh,
});

export const authenticateAction = () => ({
    type: AUTHENTICATE_ACTION,
});

export const logoutAction = () => ({
    type: LOGOUT_ACTION,
});

export const setAccessTokenAction = access => ({
    type: SET_ACCESS_TOKEN_ACTION,
    access,
});

export const setUserPreferencesAction = userPreferences => ({
    type: SET_USER_PREFERENCES,
    userPreferences,
});

// HELPER

const decodeAccessToken = (access) => {
    const decodedToken = jwtDecode(access);
    try {
        schema.validate(decodedToken, 'accessToken');
        return {
            userId: decodedToken.userId,
            exp: decodedToken.exp,
        };
    } catch (ex) {
        console.warn(ex);
        return {};
    }
};

// REDUCER

const login = (state, action) => {
    const { access, refresh } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: {
            $set: {
                access,
                refresh,
            },
        },
        activeUser: { $set: decodedToken },
    };
    return update(state, settings);
};

const authenticate = (state) => {
    const settings = {
        authenticated: { $set: true },
    };
    return update(state, settings);
};

const logout = () => initialAuthState;

const setAccessToken = (state, action) => {
    const { access } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: {
            access: { $set: access },
        },
        activeUser: { $merge: decodedToken },
    };
    return update(state, settings);
};

const setUserPreferences = (state, action) => {
    const { userPreferences } = action;
    const settings = {
        activeUser: { $merge: userPreferences },
    };
    return update(state, settings);
};

export const authReducers = {
    [LOGIN_ACTION]: login,
    [AUTHENTICATE_ACTION]: authenticate,
    [LOGOUT_ACTION]: logout,
    [SET_ACCESS_TOKEN_ACTION]: setAccessToken,
    [SET_USER_PREFERENCES]: setUserPreferences,
};

const authReducer = createReducerWithMap(authReducers, initialAuthState);
export default authReducer;
