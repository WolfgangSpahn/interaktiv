help:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

IMG_DIR = docs/
COPY_CMD = cp -r

# Convert paths to the correct format for Windows
ifeq ($(OS), Windows_NT)
    IMG_DIR := $(subst /,\\,$(IMG_DIR))
	COPY_CMD := xcopy /E /I /Y
endif

init:          	## Initialize the project.
	@npm init -y

install:        ## installs dependencies
	@npm install

build:          ## Bundle js with rollup.
	@npm run build

render:	build   ## Render the project.
	@quarto render index.qmd

images:         ## copy images to the docs folder
	@$(COPY_CMD) images $(IMG_DIR)

serve:          ## Serves the project
	cd backend && make run

clean:
	rm -rf node_modules
	find . -type f -name '*~' -delete
	cd backend && make clean
