(function(){
  var winston, bluebird, fs, request, getmac, gift, express, config, logger, get, getMac, repo, currentCommit, remoteFetch, remotes, sync, possibleIp, x$, app, readFile, Canvas, e, Image;
  winston = require('winston');
  bluebird = require('bluebird');
  fs = require('fs');
  request = require('request');
  getmac = require('getmac');
  gift = require('gift');
  express = require('express');
  config = {
    port: +process.env.PORT || 8888,
    openvgCanvas: true
  };
  logger = new winston.Logger({
    transports: [new winston.transports.Console({
      colorize: true
    })]
  });
  get = bluebird.promisify(request.get);
  getMac = bluebird.promisify(getmac.getMac);
  getMac().then(function(mac){
    logger.info("MAC address: " + mac);
    mac = mac.split(':').join('');
    return get("http://srv.maan95.com/raspberrypis/berrypis?mac_registration=" + mac);
  }).then(function(arg$){
    var res, body;
    res = arg$[0], body = arg$[1];
    if (res.statusCode !== 200) {
      throw new Error('Remote response is not OK');
    }
    return logger.debug(JSON.parse(body));
  })['catch'](function(e){
    return logger.error(e + "");
  });
  repo = gift("./");
  currentCommit = bluebird.promisify(repo.current_commit, repo);
  remoteFetch = bluebird.promisify(repo.remote_fetch, repo);
  remotes = bluebird.promisify(repo.remotes, repo);
  sync = bluebird.promisify(repo.sync, repo);
  possibleIp = function(req){
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  };
  x$ = app = express();
  x$.get('/version', function(req, res){
    logger.info("GET /version from " + possibleIp(req));
    return currentCommit().then(function(commit){
      logger.info("SEND commit id: " + commit.id);
      return res.send(commit.id);
    })['catch'](function(e){
      logger.error(e + "");
      return res.send(500, e);
    });
  });
  x$.put('/version', function(req, res){
    logger.info("PUT /version from " + possibleIp(req));
    return remoteFetch('origin').then(function(){
      return remotes().then(function(remotes){
        return currentCommit().then(function(commit){
          if (commit.id === remotes[0].commit.id) {
            logger.info("SEND not modified");
            return res.send(304);
          } else {
            return sync().then(function(){
              logger.info("SEND commit id: " + remotes[0].commit.id + ", update itself and leave");
              res.send(remotes[0].commit.id);
              return process.exit(0);
            });
          }
        });
      });
    })['catch'](function(e){
      logger.error(e + "");
      return res.send(500, e);
    });
  });
  x$.get('/focus', function(req, res){
    logger.info("GET /focus from " + possibleIp(req));
    return res.send(void 8);
  });
  x$.listen(config.port, function(){
    return logger.info("APIs listen on " + config.port);
  });
  readFile = bluebird.promisify(fs.readFile);
  try {
    Canvas = require('openvg-canvas');
  } catch (e$) {
    e = e$;
    logger.error(e + "");
    config.openvgCanvas = false;
  }
  if (config.openvgCanvas) {
    Image = Canvas.Image;
    readFile("./resources/Raspi256x256.png").then(function(data){
      var canvas, img, x$, ctx;
      canvas = new Canvas;
      img = new Image;
      img.src = data;
      x$ = ctx = canvas.getContext('2d');
      x$.fillStyle = '#16161d';
      x$.fillRect(0, 0, 1280, 1024);
      x$.drawImage(img, (1280 - 256) / 2, (1024 - 256) / 2, 256, 256);
      return canvas.vgSwapBuffers();
    })['catch'](function(e){
      return logger.error(e + "");
    });
  }
}).call(this);
