# system python interpreter. used only to create virtual environment
PY=python3
BIN=.venv/bin
FIND=find

# make it work on windows too
ifeq ($(OS), Windows_NT)
    BIN=.venv/Scripts
    PY=python
	FIND=gfind
endif

help:      ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

.venv:     ## setup the environment
.venv: requirements.txt requirements-dev.txt
	$(PY) -m venv .venv
	$(BIN)/pip install --upgrade -r requirements.txt
	$(BIN)/pip install --upgrade -r requirements-dev.txt
	$(BIN)/pip install -e .
	touch .venv

.PHONY: test
test:      ## run pytest
test: .venv
	$(BIN)/pytest

.PHONY: lint
lint:      ## run flake8
lint: .venv
	$(BIN)/flake8


.PHONY: run
run:       ## runs entry point
run: .venv
	$(BIN)/python main.py

clean:     ## clean up
clean:
	rm -rf interaktiv_server.egg-info
	rm -rf .pytest_cache
	rm -rf .venv
	$(FIND) . -type f -name '*~' -delete
	$(FIND) . -type f -name '*.pyc' -delete
	$(FIND) . -type d -name '__pycache__' -delete