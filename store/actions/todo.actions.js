import { todoService } from "../../services/todo.service.js"
import { userService } from "../../services/user.service.js"
import { updateBalance } from "./user.actions.js"
import { store, SET_TODOS, REMOVE_TODO, ADD_TODO, UPDATE_TODO, SET_IS_LOADING, SET_FILTER_BY, SET_DONE_TODOS_PERCENT, SET_MAX_PAGE } from "../store.js"

// Each action calls the todoService and then commits the result to the store.
// The component that calls it shows the success / error message.

// Loads one page of todos, returns { todos, maxPage }
export function loadTodos(filterBy) {
    store.dispatch({ type: SET_IS_LOADING, isLoading: true })
    return todoService.query(filterBy)
        .then(({ todos, maxPage }) => {
            store.dispatch({ type: SET_TODOS, todos })
            store.dispatch({ type: SET_MAX_PAGE, maxPage })
            return { todos, maxPage }
        })
        .finally(() => store.dispatch({ type: SET_IS_LOADING, isLoading: false }))
}

export function setFilterBy(filterBy) {
    store.dispatch({ type: SET_FILTER_BY, filterBy })
}

export function removeTodo(todoId) {
    const todo = store.getState().todos.find(todo => todo._id === todoId)
    return todoService.remove(todoId)
        .then(() => {
            store.dispatch({ type: REMOVE_TODO, todoId })
            _updateLoggedinUser(`Removed the Todo: '${todo.txt}'`, false)
        })
}

// Add a new todo or update an existing one (from the edit page)
// wasDone - was the todo done before the edit? Needed for the +10 balance rule
export function saveTodo(todo, wasDone) {
    const isNewTodo = !todo._id
    // Only a loggedin user can change if a todo is done (a new todo is "not done" before)
    const isStatusChanged = isNewTodo ? todo.isDone : todo.isDone !== wasDone
    if (isStatusChanged && !store.getState().loggedinUser) {
        return Promise.reject('Only a loggedin user can change the todo status')
    }

    return todoService.save(todo)
        .then(savedTodo => {
            store.dispatch({ type: isNewTodo ? ADD_TODO : UPDATE_TODO, todo: savedTodo })
            const activityTxt = isNewTodo ? 'Added a Todo' : 'Updated the Todo'
            // Points only for an existing todo that changed from not done to done
            const isCompleted = !isNewTodo && !wasDone && savedTodo.isDone
            _updateLoggedinUser(`${activityTxt}: '${savedTodo.txt}'`, isCompleted)
            return savedTodo
        })
}

// Done <-> not done (clicking the todo in the list)
export function toggleTodo(todo) {
    // Only a loggedin user can change if a todo is done
    if (!store.getState().loggedinUser) {
        return Promise.reject('Only a loggedin user can change the todo status')
    }

    const todoToSave = { ...todo, isDone: !todo.isDone }
    return todoService.save(todoToSave)
        .then(savedTodo => {
            store.dispatch({ type: UPDATE_TODO, todo: savedTodo })
            const activityTxt = savedTodo.isDone ? 'Completed the Todo' : 'Marked as not done the Todo'
            // It was not done before the toggle - so if it is done now, it changed from not done to done
            _updateLoggedinUser(`${activityTxt}: '${savedTodo.txt}'`, savedTodo.isDone)
            return savedTodo
        })
}

// Uses all the todos (not the filtered list), so the progress bar is always correct
export function loadDoneTodosPercent() {
    return todoService.getDoneTodosPercent()
        .then(doneTodosPercent => store.dispatch({ type: SET_DONE_TODOS_PERCENT, doneTodosPercent }))
}

// Adds the activity to the loggedin user, and +10 to his balance if a todo was completed.
// One after the other, so the two saves of the user don't overwrite each other.
// We don't wait for it - the todo is already saved, so the component can show its message right away.
function _updateLoggedinUser(activityTxt, isCompleted) {
    if (!store.getState().loggedinUser) return

    if (!isCompleted) {
        userService.addActivity(activityTxt)
            .catch(err => console.log('Cannot update the user:', err))
        return
    }

    updateBalance(10)
        .then(() => userService.addActivity(activityTxt))
        .catch(err => console.log('Cannot update the user:', err))
}
