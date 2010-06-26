//<script type="text/javascript">
/**
 * log desktop actions..
 * 
 * mouse:
 * xdotool getmouselocation
 *
 * xwit -property WM_NAME -print 
 * 0x3a13d6c: x=1 y=25 w=1109 h=747 d=32 'root@wideboy: /home/alan'
 * root@wideboy:/home/alan# xwit -property WM_CLASS -print 
 * 0x3a13d6c: x=1 y=25 w=1109 h=747 d=32 'gnome-terminal'
 * root@wideboy:/home/alan# 
 * 
 * -- log to a remote url.
 * 
 * LOG:
 * DATE / TIME / Application / Title
 * if cursor same as before.. - SEND IDLE... (twice, then stop sending..)
 * 
 * For commits... (we send out every 1 minute as well, it's upto the other end to determine if that means updating
 * or creating a new record..
 * If commits are done to other 
 * eg. 
 * yyyy-mm-dd /12:00 / GIT / XXXXX << repo. / 12 commits.
 * yyyy-mm-dd /12:15 / GIT / XXXXX<< repo.
 * 
 */



