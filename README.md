# Artists by playlist

Takes an iTunes Library export, looks for a playlist folder called All,
then extracts the information of all the playlists contained in it,
replacing track ids with track info from the overall Library info.

Then it groups artists by playlist and exports a list of the Artists in
each playlist.

# TODO

* The SW doesn't seem to be updating properly
* Make it render from json instead of having injected html