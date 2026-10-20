// pageIdx starts from 0, maxPage is the number of pages
export function TodoPagination({ pageIdx, maxPage, onChangePage }) {
    const isFirstPage = pageIdx === 0
    const isLastPage = pageIdx >= maxPage - 1

    return (
        <section className="todo-pagination">
            <button onClick={() => onChangePage(-1)} disabled={isFirstPage}>Previous</button>
            <span>Page {pageIdx + 1} of {maxPage}</span>
            <button onClick={() => onChangePage(1)} disabled={isLastPage}>Next</button>
        </section>
    )
}
