const fs = require('fs')
const parser = require('fast-xml-parser')

const logKeysAndTypes = (val, obj) => {
  console.log(val, typeof obj[val])
}

const file = fs.readFileSync('./Library.xml', {encoding: 'utf-8'});

const dict = parser.parse(file, {}).plist.dict
const tracks = dict.dict.dict;
const playlists = dict.array.dict;

const getTrackForId = (id) => {
  const track = tracks.filter(item => {
    return item.integer[0] === id
  })
  if (track.length === 0) {
    console.log('no track for id', id)
  } else {
    return {
      name: track[0].string[0],
      artist: track[0].string[1],
      albumArtist: track[0].string[2]
    }
  }
}

// Get the "All" playlist. There's a `string` key with an array
// with playlist name, and id
const allPlaylist = playlists.filter(item => {
  return item.string[0] === 'All';
}).reduce((pl, item) => {
  pl.name = item.string[0]
  pl.id = item.string[2]
  return pl;
}, {});

// Get all the playlists contained in "All" using that playlist's id
const playlistsInAll = playlists.filter(item => {
  return item.string[3] === allPlaylist.id;
}).map((item) => {
  return {
    name: item.string[0],
    id: item.string[2],
    tracks: item.array.dict.map(track => getTrackForId(track.integer))
  }
});

const ARTIST_KEY = 'albumArtist';

const getArtistsForTracks = (tracks) => {
  const artists = tracks.reduce((acc, track) => {
    acc[track[ARTIST_KEY]] = true;
    return acc;
  }, {})
  return Object.keys(artists)
}

const artistsPerPlaylist = playlistsInAll.reduce((acc, pl) => {
  acc[pl.id] = {
    name: pl.name,
    artists: getArtistsForTracks(pl.tracks)
  }
  return acc
}, {})

Object.keys(artistsPerPlaylist).forEach(plid => {
  const pl = artistsPerPlaylist[plid]
  console.log(`## ${pl.name}\n`)
  pl.artists.forEach(artist => {
    console.log(`* ${artist}\n`)
  })
  console.log('\n')
  console.log('\n')
})

