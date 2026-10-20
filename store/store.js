import { todoService } from "../services/todo.service.js"
import { userService } from "../services/user.service.js"

const { createStore } = Redux

// Todo
export const SET_TODOS = 'SET_TODOS'
export const REMOVE_TODO = 'REMOVE_TODO'
export const ADD_TODO = 'ADD_TODO'
export const UPDATE_TODO = 'UPDATE_TODO'

export const SET_IS_LOADING = 'SET_IS_LOADING'
export const SET_FILTER_BY = 'SET_FILTER_BY'
export const SET_DONE_TODOS_PERCENT = 'SET_DONE_TODOS_PERCENT'
export const SET_MAX_PAGE = 'SET_MAX_PAGE'

// User
export const SET_USER = 'SET_USER'
export const SET_USER_BALANCE = 'SET_USER_BALANCE'


const initialState = {
    todos: [],
    isLoading: false,
    filterBy: todoService.getDefaultFilter(),
    doneTodosPercent: 0,
    maxPage: 0,
    loggedinUser: userService.getLoggedinUser(),
}

function appReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_TODOS:
            return {
                ...state,
                todos: [...cmd.todos]
            }
        case REMOVE_TODO:
            return {
                ...state,
                todos: state.todos.filter(todo => todo._id !== cmd.todoId)
            }
        case ADD_TODO:
            return {
                ...state,
                todos: [cmd.todo, ...state.todos]
            }
        case UPDATE_TODO:
            return {
                ...state,
                todos: state.todos.map(todo => (todo._id === cmd.todo._id) ? cmd.todo : todo)
            }
        case SET_IS_LOADING:
            return {
                ...state,
                isLoading: cmd.isLoading
            }
        case SET_FILTER_BY:
            return {
                ...state,
                filterBy: { ...state.filterBy, ...cmd.filterBy }
            }
        case SET_MAX_PAGE:
            return {
                ...state,
                maxPage: cmd.maxPage
            }
        case SET_DONE_TODOS_PERCENT:
            return {
                ...state,
                doneTodosPercent: cmd.doneTodosPercent
            }
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


export const store = createStore(appReducer)
console.log('store:', store)

window.gStore = store
