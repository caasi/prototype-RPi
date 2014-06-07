require! winston
require! bluebird
require! fs
require! request
require! getmac
require! gift
require! express

config =
  width: 1920
  height: 1080
  port: +process.env.PORT or 8888

logger = new winston.Logger do
  transports:
    * new winston.transports.Console colorize: true
    ...

###
# communicate with the server
###
get     = bluebird.promisify request.get
get-mac = bluebird.promisify getmac.getMac

get-mac!
  .then (mac) ->
    logger.info "MAC address: #mac"
    mac = mac.split ':' .join ''
    get "http://srv.maan95.com/berries.json?mac_registration=#mac"
  .then ([res, body]) ->
    console.log body
    throw new Error 'Remote response is not OK' unless res.statusCode is 200
    logger.debug JSON.parse body
  .catch (e) ->
    logger.error "#e"

###
# APIs
###
repo           = gift "./"
current-commit = bluebird.promisify repo.current_commit, repo
remote-fetch   = bluebird.promisify repo.remote_fetch, repo
remotes        = bluebird.promisify repo.remotes, repo
sync           = bluebird.promisify repo.sync, repo

possible-ip = (req) ->
  req.headers['x-forwarded-for'] or req.connection.remoteAddress

(app = express!)
  ..get '/version' (req, res) ->
    logger.info "GET /version from #{possible-ip req}"
    current-commit!
      .then (commit) ->
        logger.info "SEND commit id: #{commit.id}"
        res.send commit.id
      .catch (e) ->
        logger.error "#e"
        res.send 500, e
  ..put '/version' (req, res) ->
    logger.info "PUT /version from #{possible-ip req}"
    remote-fetch 'origin'
      .then ->
        remotes <- remotes!then
        commit  <- current-commit!then
        if commit.id is remotes.0.commit.id
          logger.info "SEND not modified"
          res.send 304
        else
          sync!then ->
            logger.info "SEND commit id: #{remotes.0.commit.id}, update itself and leave"
            res.send remotes.0.commit.id
            # will be restarted by nodemon
            process.exit 0
      .catch (e) ->
        logger.error "#e"
        res.send 500, e
  ..get '/focus' (req, res) ->
    logger.info "GET /focus from #{possible-ip req}"
    res.send void
  ..listen config.port, -> logger.info "APIs listen on #{config.port}"

###
# draw things if openvg-canvas is available
###
read-file = bluebird.promisify fs.readFile

try
  Canvas = require 'openvg-canvas'
catch
  logger.error "#e"

if Canvas
  Image = Canvas.Image
  read-file "./resources/Raspi256x256.png" .then (data) ->
    # a Canvas should be new first before
    # any Image can work, may be caused by
    # vg.init()
    canvas = new Canvas
    img = new Image
    img.src = data
    ctx = canvas.getContext \2d
      ..fillStyle = '#16161d'
      ..fillRect 0, 0, config.width, config.height
      ..drawImage img, (config.width - 256) / 2, (config.height - 256) / 2, 256, 256
    canvas.vgSwapBuffers!
  .catch (e) ->
    logger.error "#e"

