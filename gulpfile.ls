require! <[gulp]>
install    = require \gulp-install
concat     = require \gulp-concat
livescript = require \gulp-livescript
nodemon    = require \gulp-nodemon

path =
  src: './src'
  build: '.'

gulp.task \install ->
  gulp.src './package.json'
  .pipe install!

gulp.task \build <[install]> ->
  gulp.src do
    * "#{path.src}/*.ls"
    ...
  .pipe concat 'index.ls'
  .pipe livescript!
  .pipe gulp.dest path.build

gulp.task \run <[build]> ->
  nodemon do
    script: 'index.js'
    ext: 'json ls'
    env:
      NODE_ENV: \production
  .on \change <[build]>

gulp.task \default <[run]>
