(function(){
  var express, gift, bluebird, repo, currentCommit, remoteFetch, remotes, sync, x$, app;
  express = require('express');
  gift = require('gift');
  bluebird = require('bluebird');
  repo = gift("./");
  currentCommit = bluebird.promisify(repo.current_commit, repo);
  remoteFetch = bluebird.promisify(repo.remote_fetch, repo);
  remotes = bluebird.promisify(repo.remotes, repo);
  sync = bluebird.promisify(repo.sync, repo);
  x$ = app = express();
  x$.get('/version', function(req, res){
    return currentCommit().then(function(commit){
      return res.send(commit.id);
    })['catch'](function(e){
      return res.send(500, e);
    });
  });
  x$.put('/version', function(req, res){
    return remoteFetch('origin').then(function(){
      return remotes().then(function(remotes){
        return currentCommit().then(function(commit){
          if (commit.id === remotes[0].commit.id) {
            return res.send(304);
          } else {
            return sync().then(function(){
              return res.send(remotes[0].commit.id);
            });
          }
        });
      });
    })['catch'](function(e){
      return res.send(500, e);
    });
  });
  x$.listen(8888, function(){
    return console.log("server started");
  });
}).call(this);
