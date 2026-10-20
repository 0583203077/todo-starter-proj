import { TodoProgress } from "./TodoProgress.jsx"

const { useSelector } = ReactRedux

export function AppFooter() {
    const doneTodosPercent = useSelector(storeState => storeState.doneTodosPercent)
    const user = useSelector(storeState => storeState.loggedinUser)

    // The loggedin user's color preferences color the footer (no user - the default colors from the CSS)
    const prefsStyle = (user && user.prefs) ? { color: user.prefs.color, backgroundColor: user.prefs.bgColor } : {}

    return (
        <footer className="app-footer full main-layout" style={prefsStyle}>
            <section className="footer-container">
                <TodoProgress percent={doneTodosPercent} />
                <p>React Todo App</p>
            </section>
        </footer>
    )
}
