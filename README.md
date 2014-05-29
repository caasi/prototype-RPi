# prototype-RPi

## JavaScript

node-openvg-canvas may be a good choice, but I cant find anything like exec\* in Python.

## Python

### notes

exec\* functions execute a new program, replacing the current process; they do not return. On Unix, the new executable is loaded into the current process, and will have the same process id as the caller.

This is awesome! I'm wondering if node has something like this?

unfortunately, GitPython only works with python2.

I have to [change permissions](http://www-user.tu-chemnitz.de/~klada/?site=projects&id=logitechkbd) of /dev/inputs/\* so I can read them properly.

Not sure how other GUI libs deal with this problem?

## resources

* [GitPython](https://gitorious.org/git-python)
* [Restarting a self-updating python script](http://stackoverflow.com/questions/1750757/restarting-a-self-updating-python-script)
