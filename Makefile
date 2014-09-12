
PKGS=   --pkg gio-2.0  \
		--pkg posix  \
		--pkg gtk+-3.0 \
		--pkg libnotify \
		--pkg  libwnck-3.0 

FLAGS= -g --vapidir=. --Xcc=-lXss --Xcc=-DWNCK_I_KNOW_THIS_IS_UNSTABLE

CORESRC=        JsRender/*.vala \
		Project/*.vala \
		Palete/*.vala \
		Builder4/Application.vala

SRC=  Gitlive.vala \
      Monitor.vala \
      GitMonitor.vala \
      Spawn.vala \
      StatusIcon.vala \
      GitRepo.vala \
    xorg_idletime.c \
    WindowLog.vala

  
all:  gitlive

gitlive:
	valac $(FLAGS) $(PKGS) $(SRC)  \
		  -o /usr/bin/Gitlive

