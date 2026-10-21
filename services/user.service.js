import { storageService } from "./async-storage.service.js"


export const userService = {
    getLoggedinUser,
    login,
    logout,
    signup,
    getById,
    query,
    getEmptyCredentials,
    updateBalance,
    addActivity,
    updateUser,
}
const STORAGE_KEY_LOGGEDIN = 'user'
const STORAGE_KEY = 'userDB'

function query() {
    return storageService.query(STORAGE_KEY)
}

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
        .then(_addMissingFields)
}

function login({ username, password }) {
    return storageService.query(STORAGE_KEY)
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password)
            if (user) return _setLoggedinUser(_addMissingFields(user))
            else return Promise.reject('Invalid login')
        })
}

function signup({ username, password, fullname }) {
    const user = _addMissingFields({ username, password, fullname })
    user.createdAt = user.updatedAt = Date.now()

    return storageService.query(STORAGE_KEY)
        .then(users => {
            // Two users with the same username could not both log in
            if (users.some(currUser => currUser.username === username)) return Promise.reject('Username is taken')
            return storageService.post(STORAGE_KEY, user)
        })
        .then(_setLoggedinUser)
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
    return Promise.resolve()
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

// Adds diff to the loggedin user's balance, returns the new balance
function updateBalance(diff) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser) return Promise.reject('No loggedin user')

    return getById(loggedinUser._id)
        .then(user => {
            // Save only the balance - put() keeps the other fields as they are
            return storageService.put(STORAGE_KEY, { _id: user._id, balance: user.balance + diff })
        })
        .then(savedUser => {
            _setLoggedinUser(savedUser)
            return savedUser.balance
        })
}

// Adds an activity to the loggedin user, for example: 'Added a Todo: Wash the dishes'
function addActivity(txt) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser) return Promise.resolve()

    return getById(loggedinUser._id)
        .then(user => {
            const activity = { txt, at: Date.now() }
            // Save only the activities - put() keeps the other fields as they are
            return storageService.put(STORAGE_KEY, { _id: user._id, activities: [...user.activities, activity] })
        })
}

// Updates the loggedin user's fullname and prefs, returns the loggedin user (as saved in the session)
function updateUser({ _id, fullname, prefs }) {
    // Save only these fields - put() keeps the balance and activities as they are
    return storageService.put(STORAGE_KEY, { _id, fullname, prefs, updatedAt: Date.now() })
        .then(savedUser => _setLoggedinUser(_addMissingFields(savedUser)))
}

function _setLoggedinUser(user) {
    const userToSave = { _id: user._id, fullname: user.fullname, balance: user.balance, prefs: user.prefs }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
    return userToSave
}

// Users that were saved before these fields existed get the default values
function _addMissingFields(user) {
    if (user.balance === undefined) user.balance = 10000
    if (!user.activities) user.activities = []
    if (!user.prefs) user.prefs = { color: 'black', bgColor: 'white' }
    return user
}

function getEmptyCredentials() {
    return {
        fullname: '',
        username: 'muki',
        password: 'muki1',
    }
}

// signup({username: 'muki', password: 'muki1', fullname: 'Muki Ja'})
// login({username: 'muki', password: 'muki1'})

// Data Model:
// const user = {
//     _id: "KAtTl",
//     username: "muki",
//     password: "muki1",
//     fullname: "Muki Ja",
//     balance: 10000,
//     activities: [{ txt: 'Added a Todo', at: 1523873242735 }],
//     prefs: { color: 'black', bgColor: 'white' },
//     createdAt: 1711490430252,
//     updatedAt: 1711490430999
// }