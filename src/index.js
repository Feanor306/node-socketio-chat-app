const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { 
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom,  
    getRoomList
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const adminName = 'Server'

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection!')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(adminName, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(adminName, `${user.username} has joined the room.`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        
        //PROFANITY FILTER = uncomment next 2 lines
        //const filter = new Filter()
        //if (filter.isProfane(message)) return callback('Profanity not allowed!')

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location.latitude,location.longitude))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit('message', generateMessage(adminName, `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//app.use(express.json())
app.get('/rooms', (req, res) => {
    const rooms = getRoomList()

    if (!rooms || rooms.length == 0){
        return res.status(400).send({})
    }

    res.header('Content-Type', 'application/json');
    res.send({ rooms })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})