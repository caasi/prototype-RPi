(function(){
  var express, gift, bluebird, winston, logger, repo, currentCommit, remoteFetch, remotes, sync, possibleIp, port, x$, app;
  express = require('express');
  gift = require('gift');
  bluebird = require('bluebird');
  winston = require('winston');
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
  x$ = app = express();
  x$.get('/version', function(req, res){
    logger.info("GET /version from " + possibleIp(req));
    return currentCommit().then(function(commit){
      logger.info("SEND commit id: " + commit.id);
      return res.send(commit.id);
    })['catch'](function(e){
      logger.error("cannot get current commit: " + e);
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
      logger.error("cannot update itself: " + e);
      return res.send(500, e);
    });
  });
  x$.get('/focus', function(req, res){
    logger.info("GET /focus from " + possibleIp(req));
    return res.send(void 8);
  });
  x$.listen(port, function(){
    return logger.info("APIs listen on " + port);
  });
}).call(this);
