#include <X11/extensions/scrnsaver.h>

extern int xorg_idletime() {
  int rc = -1;
  XScreenSaverInfo *info = XScreenSaverAllocInfo();
  Display *display = XOpenDisplay(NULL);
  
  if (display != NULL) {
	  XScreenSaverQueryInfo(display, DefaultRootWindow(display), info);
	  rc = info->idle;
	  XCloseDisplay(display);
  }
  

  XFree(info);  
  return  rc;
}
  

