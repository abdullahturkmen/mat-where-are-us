var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
})
var PORT = process.env.PORT || 3001;


var userCoordinates = [];


app.get('/', (req, res) => {
    res.send()
})


io.on("connection", (socket) => { // console.log("gelldddiiii")

    let userIndex = userCoordinates.findIndex(x => x.user_id === socket.id)

        if (userIndex < 0) {
            userCoordinates.push({
                x: '',
                y: '',
                user_id: socket.id,
            })
        }



    io.emit("allUserCoordinates", userCoordinates)

    socket.on("sendMessagesServer", (e) => {
        
        if (userCoordinates.find(e => e.user_id === socket.id).hasOwnProperty('group')) { 
            // console.log("user group : ", userCoordinates.find(e => e.user_id === socket.id))
            e.group = userCoordinates.find(e => e.user_id === socket.id).group
        }

        // console.log("mesaj : ", e)

        socket.broadcast.emit("newMessage", e)

        // io.emit("allUserCoordinates", userCoordinates)
    })

    socket.on("leftGroup", () => {

        // console.log("e : ", e)

        // console.log("user id : ", userCoordinates.findIndex(e => e.user_id === socket.id))

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)

        if (userIndex >= 0) {
            userCoordinates[userIndex] = {
                ... userCoordinates[userIndex],
                group: undefined
            }
        }
        io.emit("allUserCoordinates", userCoordinates)
    })

    socket.on("joinGroup", (e) => {

        // console.log("user id : ", userCoordinates.findIndex(e => e.user_id === socket.id))

        let userIndex = userCoordinates.findIndex(x => x.user_id === socket.id)


        if (userIndex >= 0) {
            userCoordinates[userIndex] = {
                ... userCoordinates[userIndex],
                group: e
            }
        }
        io.emit("allUserCoordinates", userCoordinates)
    })


    socket.on("updateCoordinate", (e) => { // console.log("e : ", e)

        var userIndex = userCoordinates.findIndex(x => x.user_id === socket.id)

        if (userIndex < 0) { // console.log("ifin içi")
            userCoordinates.push({
                ...e,
                user_id: socket.id
            })
        } else {

            userCoordinates[userIndex].x = e.x
            userCoordinates[userIndex].y = e.y
        } io.emit("allUserCoordinates", userCoordinates)
    })


    socket.on("disconnect", () => {

        var userIndex = userCoordinates.findIndex(e => e.user_id === socket.id)
        userCoordinates.splice(userIndex, 1)

    });

})


http.listen(PORT, function () {
    console.log("server is runnnngggg : ", PORT)
})
