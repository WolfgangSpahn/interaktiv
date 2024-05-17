# system python interpreter. used only to create virtual environment
PY = python3
BIN=.venv/bin
RM = rm -rf

# make it work on windows too
ifeq ($(OS), Windows_NT)
    BIN=.venv/Scripts
    PY=python
	RM = rmdir /s /q
endif

help:      ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

.venv:     ## setup the environment
.venv: requirements.txt requirements-dev.txt setup.py
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
	-@rm -r interaktiv_server.egg-info
	-@ $(RM) -r .venv
	-@find . -type f -name '*~' -delete
	-@find . -type f -name '*.pyc' -delete
	-@find . -type d -name '__pycache__' -delete