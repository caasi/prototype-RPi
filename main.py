#/usr/bin/python
import demo
import pi3d

DISPLAY = pi3d.Display.create(x=640, y=480)
KEYS    = pi3d.Keyboard()

FONT = pi3d.Font("fonts/FreeSans.ttf", color=(0,0,0,255), font_size=20)
GUI  = pi3d.Gui(FONT)

def cb(*args):
    print(args)

pi3d.Button(GUI, "tool_estop.gif", 0, 0, shortcut='d', callback=cb)

mx, my = 0, 0
inputs = pi3d.InputEvents()
inputs.get_mouse_movement()
while DISPLAY.loop_running():
    dx, dy, mv, mh, butt = inputs.get_mouse_movement()
    mx += dx
    my += dy
    GUI.draw(mx, my)
    if KEYS.read() == 27:
        KEYS.close()
        DISPLAY.destroy()
