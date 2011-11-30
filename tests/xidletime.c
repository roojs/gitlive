#include <X11/extensions/scrnsaver.h>
#include <stdio.h>

/**
 *
 * http://coderrr.wordpress.com/2008/04/20/getting-idle-time-in-unix/
 
  gcc -o xidletime xidletime.c -lXss
 */

int main() {
	XScreenSaverInfo *info = XScreenSaverAllocInfo();
	Display *display = XOpenDisplay(NULL);

	if (display != NULL) 
		XScreenSaverQueryInfo(display, DefaultRootWindow(display), info);
	printf("%u", info->idle);
    return 0;
}