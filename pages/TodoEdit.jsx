import { todoService } from "../services/todo.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { saveTodo } from "../store/actions/todo.actions.js"

const { useState, useEffect } = React
const { useNavigate, useParams } = ReactRouterDOM
const { useSelector } = ReactRedux

export function TodoEdit() {

    const [todoToEdit, setTodoToEdit] = useState(todoService.getEmptyTodo())
    // Was the todo done when we opened it? Needed to know if it changed from not done to done
    const [wasDone, setWasDone] = useState(false)
    const loggedinUser = useSelector(storeState => storeState.loggedinUser)
    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        if (params.todoId) loadTodo()
    }, [])

    function loadTodo() {
        todoService.get(params.todoId)
            .then(todo => {
                setTodoToEdit(todo)
                setWasDone(todo.isDone)
            })
            .catch(err => console.log('err:', err))
    }

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setTodoToEdit(prevTodoToEdit => ({ ...prevTodoToEdit, [field]: value }))
    }

    function onSaveTodo(ev) {
        ev.preventDefault()
        // Only a loggedin user can change the status (the action checks it too)
        if (!loggedinUser && todoToEdit.isDone !== wasDone) {
            showErrorMsg('Please log in to change the todo status')
            return
        }
        saveTodo(todoToEdit, wasDone)
            .then((savedTodo) => {
                navigate('/todo')
                showSuccessMsg(`Todo Saved (id: ${savedTodo._id})`)
            })
            .catch(err => {
                showErrorMsg('Cannot save todo')
                console.log('err:', err)
            })
    }

    const { txt, importance, isDone, color } = todoToEdit

    return (
        <section className="todo-edit">
            <form onSubmit={onSaveTodo} >
                <label htmlFor="txt">Text:</label>
                <input onChange={handleChange} value={txt} type="text" name="txt" id="txt" />

                <label htmlFor="importance">Importance:</label>
                <input onChange={handleChange} value={importance} type="number" name="importance" id="importance" />

                <label htmlFor="isDone">isDone:</label>
                <input onChange={handleChange} checked={isDone} disabled={!loggedinUser} type="checkbox" name="isDone" id="isDone" />
                {!loggedinUser && <p className="login-hint">Log in to change the todo status</p>}

                <label htmlFor="color">Color:</label>
                {/* Older todos were saved without a color - show the default one */}
                <input onChange={handleChange} value={color || '#99a695'} type="color" name="color" id="color" />


                <button>Save</button>
            </form>
        </section>
    )
}