import _ from 'lodash'
import { CALL_API } from 'redux-api-middleware'

// config
import config from 'config/config'

// services
import History from 'services/History'
import LocalStorage from 'services/LocalStorage'

// actions
import {
    AUTH_USER,
    UNAUTH_USER,
    ADD_TO_FAVOURITES_SUCCESS,
    ADD_TO_FAVOURITES_REQUEST,
    ADD_TO_FAVOURITES_FAILED,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILED,
    FETCH_USER_REQUEST,
    REMOVE_PERSONAL_MEMES_SUCCESS,
    REMOVE_PERSONAL_MEMES_REQUEST,
    REMOVE_PERSONAL_MEMES_FAILED
} from 'actions/user-actions/user-actions-constants';
import { showNotification } from 'actions/notification-actions/notification-actions'

// helpers
import helpers from 'helpers/helpers';

export const removePersonalMemes = () => {
    return dispatch => {
        return dispatch({
                [CALL_API]: {
                    endpoint: `${config.apiBaseUrl}/remove-personal-memes`,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                        'authorization': LocalStorage.get('token')

                    },
                    types: [
                        REMOVE_PERSONAL_MEMES_REQUEST,
                        REMOVE_PERSONAL_MEMES_SUCCESS,
                        REMOVE_PERSONAL_MEMES_FAILED
                    ],
                }

            }).then(action => {
                if (!action.error) {
                    return dispatch(showNotification({
                        type: 'notification',
                        kind: 'success',
                        message: 'ממים מועדפים נמחקו בהצלחה'
                    }))
                }

                return action;
        })
    }
}

export const signUpUser = (payload) => {
    return dispatch => {
        return dispatch(signUp(payload)).then(action => {

            const token = _.get(action, 'payload.token')

            if (token) {
                return dispatch({ type: AUTH_USER }).then(action => {
                    LocalStorage.set('token', token)
                    return dispatch(fetchUser(payload.email)).then(action => {

                        return action;
                    })
                })


            } else {
                dispatch(showNotification({
                    type: 'notification',
                    kind: 'danger',
                    message: 'אי מייל תפוס'
                }))
                return action;

            }
        })
    }
}



export function fetchUser() {
    return dispatch => {
        return dispatch({
            [CALL_API]: {
                endpoint: `${config.apiBaseUrl}/user`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'authorization': LocalStorage.get('token')

                },
                types: [
                    FETCH_USER_REQUEST,
                    FETCH_USER_SUCCESS,
                    FETCH_USER_FAILED
                ],
            }

        }).then(action => {
            if (!action.error) {
                return dispatch({ type: AUTH_USER })
            }

            return action;
        })

    }
}

export function signInUser(payload) {
    return dispatch => {
        return dispatch(signIn(payload)).then(action => {
            const token = _.get(action, 'payload.token')
            if (token) {
                dispatch({ type: AUTH_USER });
                LocalStorage.set('token', token)

                return dispatch(fetchUser()).then(action => {
                    return action;
                })

            } else {
                dispatch(showNotification({
                    type: 'notification',
                    kind: 'danger',
                    message: 'אי מייל או סיסמא לא נכונים '
                }))
                return action;

            }
        })
    }
}



export function signOut() {
    return dispatch => {

        LocalStorage.remove('token')

        return dispatch({ type: UNAUTH_USER });
    }
}

export function addToFavourites(data) {
    return {
        [CALL_API]: {
            endpoint: `${config.apiBaseUrl}/personal-meme`,
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'authorization': LocalStorage.get('token')

            },
            types: [
                ADD_TO_FAVOURITES_REQUEST,
                ADD_TO_FAVOURITES_SUCCESS,
                ADD_TO_FAVOURITES_FAILED
            ],
        }

    }

}

export function removeFromFavorites(memeId) {
    return {
        [CALL_API]: {
            endpoint: `${config.apiBaseUrl}/personal-meme`,
            method: 'DELETE',
            body: JSON.stringify({"id": memeId}),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'authorization': LocalStorage.get('token')
            },
            types: [
                REMOVE_PERSONAL_MEMES_REQUEST,
                REMOVE_PERSONAL_MEMES_SUCCESS,
                REMOVE_PERSONAL_MEMES_FAILED
            ],
        }

    }

}

export function signUp(payload) {
    return {
        [CALL_API]: {
            endpoint: `${config.apiBaseUrl}/sign-up`,
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            types: [
                'REQUEST',
                'SUCCESS',
                'FAILURE'
            ],
        }

    }
}


export const signIn = (payload) => {
    return {
        [CALL_API]: {
            endpoint: `${config.apiBaseUrl}/sign-in`,
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
            types: [
                'REQUEST',
                'SUCCESS',
                'FAILURE'
            ],
        }

    }
}