RSYNC := rsync
NPX := npx
SERVE := serve

src := $(shell find src ! -name "*.js" -type f)
art := $(shell find src ! -name "*.ts" ! -name "IPA_Font_License_Agreement_v1.0.txt" -type f)

.DEFAULT_GOAL := build
.PHONY : build

build : _site
_site : $(src)
	$(NPX) tsc --build .
	\cd src && \
	$(RSYNC) --relative $(patsubst src/%, %, $(art)) ../_site/

serve : build
	\find src -type f | entr make & \
	$(SERVE) _site
