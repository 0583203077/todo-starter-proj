const { Link } = ReactRouterDOM

// Shown for a URL that doesn't match any route
export function NotFound() {
    return (
        <section className="not-found">
            <h1>Page not found</h1>
            <p>The page you are looking for doesn't exist.</p>
            <div>
                <Link to="/" className="btn">Home</Link>
                <Link to="/todo" className="btn btn-primary">My Todos</Link>
            </div>
        </section>
    )
}
