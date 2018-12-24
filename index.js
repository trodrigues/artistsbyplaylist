const fs = require('fs')
const parser = require('fast-xml-parser')

const template = fs.readFileSync('./template.html', {encoding: 'utf-8'});
const libraryFile = fs.readFileSync('./Library.xml', {encoding: 'utf-8'});

const dict = parser.parse(libraryFile, {}).plist.dict
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

const ARTIST_KEY = 'artist';

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

const table = ({tableRows}) => `
<table>
  <tr><th>Artist</th><th>Playlist</th></tr>
  ${tableRows}
</table>
`;

const tableRows = Object.keys(artistsPerPlaylist).map(plid => {
  const pl = artistsPerPlaylist[plid];
  return pl.artists.map(artist => {
    return `<tr><td>${artist}<td></td><td>${pl.name}</td></tr>`;
  }).join('\n');
}).join('');

fs.writeFileSync(
  './artistsbyplaylist.html',
  template.replace('${content}', table({tableRows})),
  {encoding: 'utf-8'}
)