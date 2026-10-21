import { todoService } from "../services/todo.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"

const { useState, useEffect } = React
const { useParams, useNavigate, Link } = ReactRouterDOM

export function TodoDetails() {

    const [todo, setTodo] = useState(null)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadTodo()
    }, [params.todoId])


    function loadTodo() {
        todoService.get(params.todoId)
            .then(setTodo)
            .catch(err => {
                console.error('err:', err)
                showErrorMsg('Cannot load todo')
                navigate('/todo')
            })
    }

    function onBack() {
        // If nothing to do here, better use a Link
        navigate('/todo')
        // navigate(-1)
    }

    if (!todo) return <div>Loading...</div>
    return (
        <section className="todo-details">
            <h1 className={(todo.isDone)? 'done' : ''}>{todo.txt}</h1>
            <h2>{(todo.isDone)? 'Done!' : 'In your list'}</h2>

            <ul className="todo-info-list clean-list">
                <li><span>Importance:</span> {todo.importance}</li>
                <li>
                    <span>Color:</span>
                    <span className="color-swatch" style={{ backgroundColor: todo.color || '#99a695' }}></span>
                </li>
                {todo.createdAt && <li><span>Created:</span> {new Date(todo.createdAt).toLocaleString()}</li>}
                {todo.updatedAt && <li><span>Last update:</span> {new Date(todo.updatedAt).toLocaleString()}</li>}
            </ul>

            <div>
                <button onClick={onBack}>Back to list</button>
                <Link to={`/todo/edit/${todo._id}`} className="btn">Edit</Link>
            </div>
            <div>
                <Link to={`/todo/${todo.nextTodoId}`}>Next Todo</Link> |
                <Link to={`/todo/${todo.prevTodoId}`}>Previous Todo</Link>
            </div>
        </section>
    )
}