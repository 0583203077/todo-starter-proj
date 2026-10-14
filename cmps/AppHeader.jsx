const { useEffect } = React
const { Link, NavLink } = ReactRouterDOM
const { useNavigate } = ReactRouter
const { useSelector, useDispatch } = ReactRedux

import { userService } from '../services/user.service.js'
import { todoService } from '../services/todo.service.js'
import { UserMsg } from "./UserMsg.jsx"
import { LoginSignup } from './LoginSignup.jsx'
import { TodoProgress } from './TodoProgress.jsx'
import { showErrorMsg } from '../services/event-bus.service.js'
import { SET_USER, SET_DONE_TODOS_PERCENT } from '../store/store.js'


export function AppHeader() {
    const navigate = useNavigate()
    const user = useSelector(storeState => storeState.loggedinUser)
    const todos = useSelector(storeState => storeState.todos)
    const doneTodosPercent = useSelector(storeState => storeState.doneTodosPercent)
    const dispatch = useDispatch()

    // Recalculate whenever the todos in the store change (load, add, update, remove)
    useEffect(() => {
        todoService.getDoneTodosPercent()
            .then(doneTodosPercent => dispatch({ type: SET_DONE_TODOS_PERCENT, doneTodosPercent }))
            .catch(err => console.log('err:', err))
    }, [todos])

    // Apply the loggedin user's preferences to the whole app (and remove them on logout)
    useEffect(() => {
        const prefs = user && user.prefs
        document.body.style.color = prefs ? prefs.color : ''
        document.body.style.backgroundColor = prefs ? prefs.bgColor : ''
    }, [user])

    function onLogout() {
        userService.logout()
            .then(() => {
                onSetUser(null)
            })
            .catch((err) => {
                showErrorMsg('OOPs try again')
            })
    }

    function onSetUser(user) {
        dispatch({ type: SET_USER, loggedinUser: user })
        navigate('/')
    }
    return (
        <header className="app-header full main-layout">
            <section className="header-container">
                <h1>React Todo App</h1>
                {user ? (
                    < section >
                        <Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
                        <span className="user-balance">Balance: {user.balance}</span>
                        <button onClick={onLogout}>Logout</button>
                    </ section >
                ) : (
                    <section>
                        <LoginSignup onSetUser={onSetUser} />
                    </section>
                )}
                <nav className="app-nav">
                    <NavLink to="/" >Home</NavLink>
                    <NavLink to="/about" >About</NavLink>
                    <NavLink to="/todo" >Todos</NavLink>
                    <NavLink to="/dashboard" >Dashboard</NavLink>
                </nav>
            </section>
            <TodoProgress percent={doneTodosPercent} />
            <UserMsg />
        </header>
    )
}
