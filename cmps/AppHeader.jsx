const { useEffect } = React
const { Link, NavLink } = ReactRouterDOM
const { useNavigate } = ReactRouter
const { useSelector } = ReactRedux

import { UserMsg } from "./UserMsg.jsx"
import { LoginSignup } from './LoginSignup.jsx'
import { TodoProgress } from './TodoProgress.jsx'
import { showErrorMsg } from '../services/event-bus.service.js'
import { logout } from '../store/actions/user.actions.js'
import { loadDoneTodosPercent } from '../store/actions/todo.actions.js'


export function AppHeader() {
    const navigate = useNavigate()
    const user = useSelector(storeState => storeState.loggedinUser)
    const todos = useSelector(storeState => storeState.todos)
    const doneTodosPercent = useSelector(storeState => storeState.doneTodosPercent)

    // Recalculate whenever the todos in the store change (load, add, update, remove)
    useEffect(() => {
        loadDoneTodosPercent()
            .catch(err => console.log('err:', err))
    }, [todos])

    // The loggedin user's color preferences color the header (no user - the default colors from the CSS)
    const prefsStyle = (user && user.prefs) ? { color: user.prefs.color, backgroundColor: user.prefs.bgColor } : {}

    function onLogout() {
        logout()
            .then(() => navigate('/'))
            .catch((err) => {
                showErrorMsg('OOPs try again')
            })
    }

    // The login / signup action already saved the user in the store
    function onLoggedIn() {
        navigate('/')
    }
    return (
        <header className="app-header full main-layout" style={prefsStyle}>
            <section className="header-container">
                <h1>React Todo App</h1>
                <nav className="app-nav">
                    <NavLink to="/" >Home</NavLink>
                    <NavLink to="/about" >About</NavLink>
                    <NavLink to="/todo" >Todos</NavLink>
                    <NavLink to="/dashboard" >Dashboard</NavLink>
                </nav>
                {user ? (
                    <section className="user-area">
                        <Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
                        <span className="user-balance">Balance: {user.balance}</span>
                        <button onClick={onLogout}>Logout</button>
                    </section>
                ) : (
                    <section className="user-area">
                        <LoginSignup onLoggedIn={onLoggedIn} />
                    </section>
                )}
            </section>
            <TodoProgress percent={doneTodosPercent} />
            <UserMsg />
        </header>
    )
}
