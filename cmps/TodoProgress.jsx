export function TodoProgress({ percent }) {
    return (
        <section className="todo-progress" title={`${percent}% of the todos are done`}>
            <div className="todo-progress-bar" style={{ width: percent + '%' }}></div>
            <span>{percent}% done</span>
        </section>
    )
}
