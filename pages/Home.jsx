import { ToggleButton } from "../cmps/ToggleButton.jsx"

const { useState } = React
const { Link } = ReactRouterDOM

export function Home() {

    const [isOn, setIsOn] = useState(false)

    return (
        <section className="home">
            <h1>Todo's R Us!</h1>
            <p className="home-subtitle">Keep your todos in one place, track your progress and earn points for every todo you complete.</p>
            <Link to="/todo" className="btn btn-primary">Go to my todos</Link>
            <ToggleButton val={isOn} setVal={setIsOn} />
            {isOn && <img src="assets/img/todo.png" alt="" />}
        </section>
    )
}
