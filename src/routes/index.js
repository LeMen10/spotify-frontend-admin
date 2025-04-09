import Home from "~/pages/Home/Home"
import Login from "~/pages/Login/Login"
import Users from "~/pages/Users/Users"
import TrashUsers from "~/pages/TrashUsers/TrashUsers"


const publicRouter = [
    {path: '/', component: Home},
    {path: '/trash-users', component: TrashUsers},
    {path: '/users', component: Users},
    {path: '/login', component: Login, layout: null},
]

const privateRouter = [

]

export { publicRouter, privateRouter }