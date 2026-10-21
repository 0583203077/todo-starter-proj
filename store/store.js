import { todoReducer } from "./reducers/todo.reducer.js"
import { userReducer } from "./reducers/user.reducer.js"

const { createStore, combineReducers } = Redux

// One store, made of two modules:
// storeState.todoStore - todos, isLoading, filterBy, doneTodosPercent, maxPage
// storeState.userStore - loggedinUser
const rootReducer = combineReducers({
    todoStore: todoReducer,
    userStore: userReducer,
})

export const store = createStore(rootReducer)
console.log('store:', store)

window.gStore = store
