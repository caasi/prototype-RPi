(function(){
  var express, gift, bluebird, winston, Canvas, canvas, x$, ctx, logger, repo, currentCommit, remoteFetch, remotes, sync, possibleIp, port, y$, app;
  express = require('express');
  gift = require('gift');
  bluebird = require('bluebird');
  winston = require('winston');
  Canvas = require('openvg-canvas');
  canvas = new Canvas;
  x$ = ctx = canvas.getContext('2d');
  x$.fillStyle = '#16161d';
  x$.fillRect(0, 0, 1280, 1024);
  canvas.vgSwapBuffers();
  logger = new winston.Logger({
    transports: [new winston.transports.Console({
      colorize: true
    })]
  });
  repo = gift("./");
  currentCommit = bluebird.promisify(repo.current_commit, repo);
  remoteFetch = bluebird.promisify(repo.remote_fetch, repo);
  remotes = bluebird.promisify(repo.remotes, repo);
  sync = bluebird.promisify(repo.sync, repo);
  possibleIp = function(req){
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  };
  port = 8888;
  y$ = app = express();
  y$.get('/version', function(req, res){
    logger.info("GET /version from " + possibleIp(req));
    return currentCommit().then(function(commit){
      logger.info("SEND commit id: " + commit.id);
      return res.send(commit.id);
    })['catch'](function(e){
      logger.error("cannot get current commit: " + e);
      return res.send(500, e);
    });
  });
  y$.put('/version', function(req, res){
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
      logger.error("cannot update itself: " + e);
      return res.send(500, e);
    });
  });
  y$.get('/focus', function(req, res){
    logger.info("GET /focus from " + possibleIp(req));
    return res.send(void 8);
  });
  y$.listen(port, function(){
    return logger.info("APIs listen on " + port);
  });
}).call(this);
