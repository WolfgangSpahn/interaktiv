help:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

init:          	## Initialize the project.
	@npm init -y

build:          ## Bundle js with rollup.
	@npm run build

render:	build   ## Render the project.
	@quarto render index.qmd

images:         ## copy images to the docs folder
	@xcopy images docs\images /E /I /Y