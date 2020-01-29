const $roomsButton = document.querySelector('#check-rooms')
const $roomsCon = document.querySelector('#rooms-container')
const $roomInput = document.querySelector('#room-input')

const loadRooms = (rooms) => {
    rooms = rooms.rooms
    if (!rooms || rooms.length == 0) {
        return;
    } else {
        let html = '';

        rooms.forEach((room) => {
            html += `<div class="room-result">${room}</div>`
        });

        $roomsCon.insertAdjacentHTML('beforeend', html)
        let $roomResults = document.querySelectorAll('.room-result')

        $roomResults.forEach((rr) => {
            rr.addEventListener('click', function(e) {
                $roomInput.value = this.innerHTML
            })
        })
    }
}

$roomsButton.addEventListener('click', () => {
    fetch('/rooms').then((response) => {
        return response.json()
    }).then((rooms) => {
        loadRooms(rooms)
    }).catch((e) => console.log(e))
})