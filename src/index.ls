require! express
require! gift
require! bluebird

repo = gift "./"
current-commit = bluebird.promisify repo.current_commit, repo
remote-fetch   = bluebird.promisify repo.remote_fetch, repo
remotes        = bluebird.promisify repo.remotes, repo
sync           = bluebird.promisify repo.sync, repo

port = 8888

(app = express!)
  ..get '/version' (req, res) ->
    current-commit!
      .then (commit) -> res.send commit.id
      .catch (e) -> res.send 500, e
  ..put '/version' (req, res) ->
    remote-fetch 'origin'
      .then ->
        remotes <- remotes!then
        commit  <- current-commit!then
        if commit.id is remotes.0.commit.id
          res.send 304
        else
          sync!then ->
            res.send remotes.0.commit.id
            # should exit and run the new script
            process.exit 0
      .catch (e) -> res.send 500, e
  ..get '/focus' (req, res) ->
    res.send void
  ..listen port, -> console.log "listen on #{port}"
