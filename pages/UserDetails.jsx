import { userService } from "../services/user.service.js"
import { utilService } from "../services/util.service.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { updateUser } from "../store/actions/user.actions.js"

const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM
const { useSelector } = ReactRedux

export function UserDetails() {

    const [user, setUser] = useState(null)
    const [userToEdit, setUserToEdit] = useState(null)
    const loggedinUser = useSelector(storeState => storeState.userStore.loggedinUser)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
    }, [params.userId])

    function loadUser() {
        userService.getById(params.userId)
            .then(user => {
                setUser(user)
                const prefs = { color: toHexColor(user.prefs.color), bgColor: toHexColor(user.prefs.bgColor) }
                setUserToEdit({ fullname: user.fullname, prefs })
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot load user')
                navigate('/')
            })
    }

    // <input type="color"> works only with hex colors, but the default prefs are 'black' and 'white'
    function toHexColor(color) {
        if (color === 'black') return '#000000'
        if (color === 'white') return '#ffffff'
        return color
    }

    function handleChange({ target }) {
        const { name, value } = target
        if (name === 'fullname') {
            setUserToEdit(prevUserToEdit => ({ ...prevUserToEdit, fullname: value }))
        } else {
            // color / bgColor are inside prefs
            setUserToEdit(prevUserToEdit => ({ ...prevUserToEdit, prefs: { ...prevUserToEdit.prefs, [name]: value } }))
        }
    }

    function onSaveUser(ev) {
        ev.preventDefault()
        updateUser({ _id: user._id, ...userToEdit })
            .then(() => {
                setUser(prevUser => ({ ...prevUser, ...userToEdit }))
                showSuccessMsg('Your details were saved')
            })
            .catch(err => {
                console.log('err:', err)
                showErrorMsg('Cannot save your details')
            })
    }

    if (!user) return <div>Loading...</div>

    // Only the user himself can edit his details
    const isOwnPage = loggedinUser && loggedinUser._id === user._id
    // Newest activity first
    const activities = [...user.activities].reverse()

    return (
        <section className="user-details">
            <h1>{user.fullname}</h1>
            {isOwnPage && <h3>Balance: {user.balance}</h3>}

            {isOwnPage && (
                <form className="user-edit" onSubmit={onSaveUser}>
                    <h2>Edit your details</h2>
                    <label htmlFor="fullname">Full name:</label>
                    <input onChange={handleChange} value={userToEdit.fullname} type="text" name="fullname" id="fullname" required />

                    <label htmlFor="color">Text color:</label>
                    <input onChange={handleChange} value={userToEdit.prefs.color} type="color" name="color" id="color" />

                    <label htmlFor="bgColor">Background color:</label>
                    <input onChange={handleChange} value={userToEdit.prefs.bgColor} type="color" name="bgColor" id="bgColor" />

                    <div className="prefs-preview" style={{ color: userToEdit.prefs.color, backgroundColor: userToEdit.prefs.bgColor }}>
                        Preview: this is how the header and footer will look
                    </div>

                    <button>Save</button>
                </form>
            )}

            <h2>Activities</h2>
            {!activities.length && <p>No activities yet...</p>}
            <ul className="activities clean-list">
                {activities.map(activity =>
                    <li key={activity.at}>
                        <span className="activity-time">{utilService.getTimeAgo(activity.at)}:</span> {activity.txt}
                    </li>
                )}
            </ul>
        </section>
    )
}
