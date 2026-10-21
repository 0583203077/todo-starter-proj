import { TodoFilter } from "../cmps/TodoFilter.jsx"
import { TodoList } from "../cmps/TodoList.jsx"
import { DataTable } from "../cmps/data-table/DataTable.jsx"
import { TodoPagination } from "../cmps/TodoPagination.jsx"
import { todoService } from "../services/todo.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { loadTodos, setFilterBy, removeTodo, toggleTodo } from "../store/actions/todo.actions.js"

const { Link, useSearchParams } = ReactRouterDOM
const { useSelector } = ReactRedux

export function TodoIndex() {

    const todos = useSelector(storeState => storeState.todoStore.todos)
    const isLoading = useSelector(storeState => storeState.todoStore.isLoading)
    const filterBy = useSelector(storeState => storeState.todoStore.filterBy)
    const maxPage = useSelector(storeState => storeState.todoStore.maxPage)
    const loggedinUser = useSelector(storeState => storeState.userStore.loggedinUser)

    // Special hook for accessing search-params:
    const [searchParams, setSearchParams] = useSearchParams()

    // The filter from the URL - TodoFilter starts with it
    const defaultFilter = todoService.getFilterFromSearchParams(searchParams)

    // TodoFilter calls this when it first shows up, and on every change
    function onSetFilterBy(newFilterBy) {
        // A new text / importance / status starts again from the first page.
        // When the page first shows up, the filter is the same as in the URL - so we keep the URL's page
        const isNewFilter = newFilterBy.txt !== defaultFilter.txt
            || newFilterBy.importance !== defaultFilter.importance
            || newFilterBy.status !== defaultFilter.status
        applyFilter({ ...newFilterBy, pageIdx: isNewFilter ? 0 : defaultFilter.pageIdx })
    }

    // diff: -1 for the previous page, 1 for the next page
    function onChangePage(diff) {
        applyFilter({ ...filterBy, pageIdx: filterBy.pageIdx + diff })
    }

    // Saves the filter in the URL and in the store, and loads its page
    function applyFilter(filterBy) {
        // Update the URL only when the filter is different from what is already there
        if (JSON.stringify(filterBy) !== JSON.stringify(defaultFilter)) setSearchParams(filterBy)
        setFilterBy(filterBy)
        loadPage(filterBy)
    }

    function loadPage(filterBy) {
        loadTodos(filterBy)
            .then(({ maxPage }) => {
                // The page doesn't exist anymore (for example: we removed its last todo) - go to the last page
                if (filterBy.pageIdx > 0 && filterBy.pageIdx >= maxPage) {
                    applyFilter({ ...filterBy, pageIdx: Math.max(maxPage - 1, 0) })
                }
            })
            .catch(err => {
                console.error('err:', err)
                showErrorMsg('Cannot load todos')
            })
    }

    function onRemoveTodo(todoId) {
        if (!confirm('Are you sure you want to delete this todo?')) return
        removeTodo(todoId)
            .then(() => {
                showSuccessMsg(`Todo removed`)
                // Load the page again, so the next todo moves up into this page
                loadPage(filterBy)
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot remove todo ' + todoId)
            })
    }

    function onToggleTodo(todo) {
        // Only a loggedin user can complete a todo (the action checks it too)
        if (!loggedinUser) {
            showErrorMsg('Please log in to change the todo status')
            return
        }
        toggleTodo(todo)
            .then(savedTodo => {
                showSuccessMsg(`Todo is ${(savedTodo.isDone)? 'done' : 'back on your list'}`)
                // With the Active / Done filter, the todo doesn't belong to this list anymore - load the page again
                if (filterBy.status) loadPage(filterBy)
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot toggle todo ' + todo._id)
            })
    }

    return (
        <section className="todo-index">
            <TodoFilter filterBy={defaultFilter} onSetFilterBy={onSetFilterBy} />
            <div>
                <Link to="/todo/edit" className="btn btn-primary" >Add Todo</Link>
            </div>
            <h2>Todos List</h2>
            {isLoading && <div className="loading">Loading todos...</div>}
            {!isLoading && !todos.length && <div className="no-todos">No todos to show...</div>}
            {!isLoading && !!todos.length && <TodoList todos={todos} onRemoveTodo={onRemoveTodo} onToggleTodo={onToggleTodo} />}

            {/* Outside the loading check, so it doesn't jump while the next page is loading */}
            {maxPage > 1 && <TodoPagination pageIdx={filterBy.pageIdx} maxPage={maxPage} onChangePage={onChangePage} />}

            {!isLoading && !!todos.length && <React.Fragment>
                <hr />
                <h2>Todos Table</h2>
                <div className="table-container">
                    <DataTable todos={todos} onRemoveTodo={onRemoveTodo} />
                </div>
            </React.Fragment>}
        </section>
    )
}
