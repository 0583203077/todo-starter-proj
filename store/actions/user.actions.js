import { userService } from "../../services/user.service.js"
import { store, SET_USER, SET_USER_BALANCE } from "../store.js"

// Each action calls the userService and then commits the result to the store.
// The component that calls it shows the success / error message.

export function login(credentials) {
    return userService.login(credentials)
        .then(loggedinUser => {
            store.dispatch({ type: SET_USER, loggedinUser })
            return loggedinUser
        })
}

export function signup(credentials) {
    return userService.signup(credentials)
        .then(loggedinUser => {
            store.dispatch({ type: SET_USER, loggedinUser })
            return loggedinUser
        })
}

export function logout() {
    return userService.logout()
        .then(() => store.dispatch({ type: SET_USER, loggedinUser: null }))
}

// Saves the loggedin user's fullname and prefs
export function updateUser(userToUpdate) {
    return userService.updateUser(userToUpdate)
        .then(loggedinUser => {
            store.dispatch({ type: SET_USER, loggedinUser })
            return loggedinUser
        })
}

// The balance only grows - we don't take points back when a todo is marked as not done
export function updateBalance(diff) {
    return userService.updateBalance(diff)
        .then(balance => {
            store.dispatch({ type: SET_USER_BALANCE, balance })
            return balance
        })
}
