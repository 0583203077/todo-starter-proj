import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const TODO_KEY = 'todoDB'
const PAGE_SIZE = 5
_createTodos()

export const todoService = {
    query,
    get,
    remove,
    save,
    getEmptyTodo,
    getDefaultFilter,
    getFilterFromSearchParams,
    getImportanceStats,
    getDoneTodosPercent,
}
// For Debug (easy access from console):
window.cs = todoService

function query(filterBy = {}) {
    return storageService.query(TODO_KEY)
        .then(todos => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                todos = todos.filter(todo => regExp.test(todo.txt))
            }

            if (filterBy.importance) {
                todos = todos.filter(todo => todo.importance >= filterBy.importance)
            }

            if (filterBy.status === 'active') {
                todos = todos.filter(todo => !todo.isDone)
            } else if (filterBy.status === 'done') {
                todos = todos.filter(todo => todo.isDone)
            }

            // Newest todos first (before paging - so a new todo is on the first page)
            todos.sort((todo1, todo2) => todo2.createdAt - todo1.createdAt)

            // Paging - only when a pageIdx is given (the Dashboard asks for all the todos)
            const maxPage = Math.ceil(todos.length / PAGE_SIZE)
            if (filterBy.pageIdx !== undefined) {
                const startIdx = filterBy.pageIdx * PAGE_SIZE
                todos = todos.slice(startIdx, startIdx + PAGE_SIZE)
            }

            return { todos, maxPage }
        })
}

function get(todoId) {
    return storageService.get(TODO_KEY, todoId)
        .then(todo => {
            todo = _setNextPrevTodoId(todo)
            return todo
        })
}

function remove(todoId) {
    return storageService.remove(TODO_KEY, todoId)
}

function save(todo) {
    if (todo._id) {
        // TODO - updatable fields
        todo.updatedAt = Date.now()
        return storageService.put(TODO_KEY, todo)
    } else {
        todo.createdAt = todo.updatedAt = Date.now()

        return storageService.post(TODO_KEY, todo)
    }
}

function getEmptyTodo(txt = '', importance = 5, color = '#99a695') {
    return { txt, importance, isDone: false, color }
}

function getDefaultFilter() {
    // status: '' (all) | 'active' | 'done'
    // pageIdx: 0 is the first page
    return { txt: '', importance: 0, status: '', pageIdx: 0 }
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter()
    const filterBy = {}
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || ''
    }
    // The page is a number (a URL without a page starts from the first page)
    filterBy.pageIdx = +filterBy.pageIdx || 0
    return filterBy
}


function getImportanceStats() {
    return storageService.query(TODO_KEY)
        .then(todos => {
            const todoCountByImportanceMap = _getTodoCountByImportanceMap(todos)
            const data = Object.keys(todoCountByImportanceMap).map(speedName => ({ title: speedName, value: todoCountByImportanceMap[speedName] }))
            return data
        })

}

// Uses all the todos (not the filtered list), so the progress bar is always correct
function getDoneTodosPercent() {
    return storageService.query(TODO_KEY)
        .then(todos => {
            if (!todos.length) return 0
            const doneTodosCount = todos.filter(todo => todo.isDone).length
            return Math.round(doneTodosCount * 100 / todos.length)
        })
}

function _createTodos() {
    let todos = utilService.loadFromStorage(TODO_KEY)
    if (!todos || !todos.length) {
        todos = []
        const txts = ['Learn React', 'Master CSS', 'Practice Redux']
        const colors = ['#99a695', '#cdddc8', '#e9cedd', '#f6e3b4', '#c9def4']
        for (let i = 0; i < 20; i++) {
            const txt = txts[utilService.getRandomIntInclusive(0, txts.length - 1)]
            const color = colors[utilService.getRandomIntInclusive(0, colors.length - 1)]
            todos.push(_createTodo(txt + (i + 1), utilService.getRandomIntInclusive(1, 10), color))
        }
        utilService.saveToStorage(TODO_KEY, todos)
    }
}

function _createTodo(txt, importance, color) {
    const todo = getEmptyTodo(txt, importance, color)
    todo._id = utilService.makeId()
    todo.createdAt = todo.updatedAt = Date.now() - utilService.getRandomIntInclusive(0, 1000 * 60 * 60 * 24)
    return todo
}

function _setNextPrevTodoId(todo) {
    return storageService.query(TODO_KEY).then((todos) => {
        const todoIdx = todos.findIndex((currTodo) => currTodo._id === todo._id)
        const nextTodo = todos[todoIdx + 1] ? todos[todoIdx + 1] : todos[0]
        const prevTodo = todos[todoIdx - 1] ? todos[todoIdx - 1] : todos[todos.length - 1]
        todo.nextTodoId = nextTodo._id
        todo.prevTodoId = prevTodo._id
        return todo
    })
}

function _getTodoCountByImportanceMap(todos) {
    const todoCountByImportanceMap = todos.reduce((map, todo) => {
        if (todo.importance < 3) map.low++
        else if (todo.importance < 7) map.normal++
        else map.urgent++
        return map
    }, { low: 0, normal: 0, urgent: 0 })
    return todoCountByImportanceMap
}


// Data Model:
// const todo = {
//     _id: "gZ6Nvy",
//     txt: "Master Redux",
//     importance: 9,
//     isDone: false,
//     color: "#99a695",
//     createdAt: 1711472269690,
//     updatedAt: 1711472269690
// }

