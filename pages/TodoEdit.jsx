import { todoService } from "../services/todo.service.js"
import { userService } from "../services/user.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { ADD_TODO, UPDATE_TODO, SET_USER_BALANCE } from "../store/store.js"

const { useState, useEffect } = React
const { useNavigate, useParams } = ReactRouterDOM
const { useSelector, useDispatch } = ReactRedux

export function TodoEdit() {

    const [todoToEdit, setTodoToEdit] = useState(todoService.getEmptyTodo())
    // Was the todo done when we opened it? Needed to know if it changed from not done to done
    const [wasDone, setWasDone] = useState(false)
    const loggedinUser = useSelector(storeState => storeState.loggedinUser)
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch()

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
        const isNewTodo = !todoToEdit._id
        todoService.save(todoToEdit)
            .then((savedTodo) => {
                dispatch({ type: isNewTodo ? ADD_TODO : UPDATE_TODO, todo: savedTodo })
                navigate('/todo')
                showSuccessMsg(`Todo Saved (id: ${savedTodo._id})`)
                if (!loggedinUser) return

                const activityTxt = isNewTodo ? 'Added a Todo' : 'Updated the Todo'
                // Points only for an existing todo that changed from not done to done
                if (!isNewTodo && !wasDone && savedTodo.isDone) {
                    // One after the other, so the two saves of the user don't overwrite each other
                    return rewardUser()
                        .then(() => userService.addActivity(`${activityTxt}: '${savedTodo.txt}'`))
                }
                return userService.addActivity(`${activityTxt}: '${savedTodo.txt}'`)
            })
            .catch(err => {
                showErrorMsg('Cannot save todo')
                console.log('err:', err)
            })
    }

    // The balance only grows - we don't take points back when a todo is marked as not done
    function rewardUser() {
        return userService.updateBalance(10)
            .then(balance => dispatch({ type: SET_USER_BALANCE, balance }))
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
                <input onChange={handleChange} checked={isDone} type="checkbox" name="isDone" id="isDone" />

                <label htmlFor="color">Color:</label>
                {/* Older todos were saved without a color - show the default one */}
                <input onChange={handleChange} value={color || '#99a695'} type="color" name="color" id="color" />


                <button>Save</button>
            </form>
        </section>
    )
}