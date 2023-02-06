var rooms = {};

exports.addroomsToRoom = (username, roomId) => {
    if (username && roomId && rooms[roomId] && rooms[roomId].includes(username)) {
        return rooms;
    } else if (username && roomId && rooms[roomId] && username) {
        rooms[roomId].push(username);
        return rooms
    } else if (username && roomId) {
        rooms[roomId] = [];
        rooms[roomId].push(username);
        return rooms
    }


}

exports.getRooms = () => {
    return rooms
}

exports.removeUserFromRoom = (username) => {
    const roomIds = Object.keys(rooms);
    // console.log(rooms, "rooms")
    const newRooms = {}
    for (let i = 0; i < roomIds.length; i++) {
        const usersInRoom = rooms[roomIds[i]].filter(user => user !== username);

        // console.log(usersInRoom, "users", username)
        if (usersInRoom.length > 0) {
            newRooms[roomIds[i]] = usersInRoom;
        } else {
            delete newRooms[roomIds[i]]
        }
        // io.to(rooms[roomIds[i]]).emit("updatedroomusers", newRooms)
    }
    rooms = newRooms;
    return newRooms
}