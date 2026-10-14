import { TodoFilter } from "../cmps/TodoFilter.jsx"
import { TodoList } from "../cmps/TodoList.jsx"
import { DataTable } from "../cmps/data-table/DataTable.jsx"
import { todoService } from "../services/todo.service.js"
import { userService } from "../services/user.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { SET_TODOS, REMOVE_TODO, UPDATE_TODO, SET_IS_LOADING, SET_FILTER_BY, SET_USER_BALANCE } from "../store/store.js"

const { Link, useSearchParams } = ReactRouterDOM
const { useSelector, useDispatch } = ReactRedux

export function TodoIndex() {

    const todos = useSelector(storeState => storeState.todos)
    const isLoading = useSelector(storeState => storeState.isLoading)
    const loggedinUser = useSelector(storeState => storeState.loggedinUser)
    const dispatch = useDispatch()

    // Special hook for accessing search-params:
    const [searchParams, setSearchParams] = useSearchParams()

    // The filter from the URL - TodoFilter starts with it
    const defaultFilter = todoService.getFilterFromSearchParams(searchParams)

    // TodoFilter calls this when it first shows up, and on every change
    function onSetFilterBy(filterBy) {
        // Update the URL only when the filter is different from what is already there
        if (JSON.stringify(filterBy) !== JSON.stringify(defaultFilter)) setSearchParams(filterBy)
        dispatch({ type: SET_FILTER_BY, filterBy })
        loadTodos(filterBy)
    }

    function loadTodos(filterBy) {
        dispatch({ type: SET_IS_LOADING, isLoading: true })
        todoService.query(filterBy)
            .then(todos => dispatch({ type: SET_TODOS, todos }))
            .catch(err => {
                console.error('err:', err)
                showErrorMsg('Cannot load todos')
            })
            .finally(() => dispatch({ type: SET_IS_LOADING, isLoading: false }))
    }

    function onRemoveTodo(todoId) {
        if (!confirm('Are you sure you want to delete this todo?')) return
        const todo = todos.find(todo => todo._id === todoId)
        todoService.remove(todoId)
            .then(() => {
                dispatch({ type: REMOVE_TODO, todoId })
                showSuccessMsg(`Todo removed`)
                if (loggedinUser) return userService.addActivity(`Removed the Todo: '${todo.txt}'`)
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot remove todo ' + todoId)
            })
    }

    function onToggleTodo(todo) {
        const todoToSave = { ...todo, isDone: !todo.isDone }
        todoService.save(todoToSave)
            .then((savedTodo) => {
                dispatch({ type: UPDATE_TODO, todo: savedTodo })
                showSuccessMsg(`Todo is ${(savedTodo.isDone)? 'done' : 'back on your list'}`)
                if (!loggedinUser) return

                const activityTxt = savedTodo.isDone ? 'Completed the Todo' : 'Marked as not done the Todo'
                if (savedTodo.isDone) {
                    // It was not done before the toggle - so it changed from not done to done.
                    // One after the other, so the two saves of the user don't overwrite each other
                    return rewardUser()
                        .then(() => userService.addActivity(`${activityTxt}: '${savedTodo.txt}'`))
                }
                return userService.addActivity(`${activityTxt}: '${savedTodo.txt}'`)
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot toggle todo ' + todo._id)
            })
    }

    // The balance only grows - we don't take points back when a todo is marked as not done
    function rewardUser() {
        return userService.updateBalance(10)
            .then(balance => dispatch({ type: SET_USER_BALANCE, balance }))
    }

    return (
        <section className="todo-index">
            <TodoFilter filterBy={defaultFilter} onSetFilterBy={onSetFilterBy} />
            <div>
                <Link to="/todo/edit" className="btn" >Add Todo</Link>
            </div>
            <h2>Todos List</h2>
            {isLoading && <div className="loading">Loading todos...</div>}
            {!isLoading && !todos.length && <div className="no-todos">No todos to show...</div>}
            {!isLoading && !!todos.length && <React.Fragment>
                <TodoList todos={todos} onRemoveTodo={onRemoveTodo} onToggleTodo={onToggleTodo} />
                <hr />
                <h2>Todos Table</h2>
                <div style={{ width: '60%', margin: 'auto' }}>
                    <DataTable todos={todos} onRemoveTodo={onRemoveTodo} />
                </div>
            </React.Fragment>}
        </section>
    )
}
