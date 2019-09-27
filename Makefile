NPM    := npm
PARCEL := $(NPM) run parcel

.PHONY : all prepare build clean

all : prepare build

prepare : package.json package-lock.json
	$(NPM) i

build : dist/index.html

dist/index.html : src/index.html
	$(PARCEL) build src/index.html

clean :
	rm -rf .cache/
	rm -rf dist/
