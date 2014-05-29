require! <[gulp]>
concat = require \gulp-concat
livescript = require \gulp-livescript

path =
  src: './src'
  build: '.'

gulp.task \js ->
  gulp.src do
    * "#{path.src}/*.ls"
    ...
  .pipe concat 'index.ls'
  .pipe livescript!
  .pipe gulp.dest path.build

gulp.task \default <[js]>
