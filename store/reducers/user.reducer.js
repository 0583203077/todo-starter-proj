import { userService } from "../../services/user.service.js"

// User
export const SET_USER = 'SET_USER'
export const SET_USER_BALANCE = 'SET_USER_BALANCE'


const initialState = {
    loggedinUser: userService.getLoggedinUser(),
}

// Manages storeState.userStore
export function userReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_USER:
            return {
                ...state,
                loggedinUser: cmd.loggedinUser
            }
        case SET_USER_BALANCE:
            return {
                ...state,
                loggedinUser: { ...state.loggedinUser, balance: cmd.balance }
            }

        default: return state
    }
}
