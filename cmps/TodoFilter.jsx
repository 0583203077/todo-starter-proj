const { useState, useEffect } = React

export function TodoFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState({...filterBy})

    useEffect(() => {
        // Notify parent
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

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

            default: break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    // Optional support for LAZY Filtering with a button
    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, importance, status } = filterByToEdit
    return (
        <section className="todo-filter">
            <h2>Filter Todos</h2>
            <form onSubmit={onSubmitFilter}>
                <div className="filter-field filter-txt">
                    <label htmlFor="txt">Search</label>
                    <input value={txt} onChange={handleChange}
                        type="search" placeholder="Search todos..." id="txt" name="txt"
                    />
                </div>
                <div className="filter-field">
                    <label htmlFor="importance">Min. importance</label>
                    <input value={importance} onChange={handleChange}
                        type="number" placeholder="Any" id="importance" name="importance"
                    />
                </div>
                <div className="filter-field">
                    <label htmlFor="status">Status</label>
                    <select value={status} onChange={handleChange} id="status" name="status">
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <button hidden>Set Filter</button>
            </form>
        </section>
    )
}