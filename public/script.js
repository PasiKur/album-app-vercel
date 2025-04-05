const result = document.querySelector('.result')
const baseUrl = `${window.location.origin}/api/albums` // changed api to albums

// changed const fetchVehicles to fetchAlbums
const fetchAlbums = async () => {
  try {
    const response = await fetch(baseUrl)
    const data = await response.json()

    // changed vehicles to album
    const albums = data.data.map((album) => {
      // changed vehicle data to album data (title, artist, year, genre)
      return `<ul>
                <li>Title:${album.title}</li>
                <li>Artist:${album.artist}</li>
                <li>Year:${album.year}</li>
                <li>Genre:${album.genre}</li>
              </ul>`
    })
    result.innerHTML = albums.join('') // this puts albums to index.html div with id "result"
  } catch (error) {
    console.log(error)
    result.innerHTML = `<div class="alert alert-danger">Could not fetch data</div>`
  }
}

fetchAlbums()
