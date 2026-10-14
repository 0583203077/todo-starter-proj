import { TodoProgress } from "./TodoProgress.jsx"

const { useSelector } = ReactRedux

export function AppFooter() {
    const doneTodosPercent = useSelector(storeState => storeState.doneTodosPercent)

    return (
        <footer className="app-footer full main-layout">
            <section className="footer-container">
                <TodoProgress percent={doneTodosPercent} />
                <p>React Todo App</p>
            </section>
        </footer>
    )
}
