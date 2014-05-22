#/usr/bin/python
import demo
import pi3d

DISPLAY = pi3d.Display.create(x=150, y=150)
KEYS    = pi3d.Keyboard()

while DISPLAY.loop_running():
    if KEYS.read() == 27:
        KEYS.close()
        DISPLAY.destroy()
