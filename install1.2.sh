#!/bin/sh

# installs the working girs!
#git clone git://github.com/roojs/gir-1.2-gtk-3.0.git gir-1.2

#// compile GIR's
mkdir -p ~/.Builder/girepository-1.2 || false
 
 
ls gir-1.2 | sed s/.gir// | awk \
    '{ print "g-ir-compiler  gir-1.2/" $1 ".gir --includedir=gir-1.2 -o  ~/.Builder/girepository-1.2/" $1 ".typelib" }' \
    | sh -x



cp ~/.Builder/girepository-1.2/GLib-2.0.typelib /usr/lib/girepository-1.0/
