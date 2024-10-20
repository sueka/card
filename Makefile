PLATFORM := $(shell uname -s)

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
ifeq ($(PLATFORM),Darwin)
	\cd src && \
	$(RSYNC) --relative $(patsubst src/%, %, $(art)) ../_site/
else
	\cp --parents $(art) _site/
endif

serve : build
	\find src -type f | entr make & \
	$(SERVE) _site
