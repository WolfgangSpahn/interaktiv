help:      ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

venv:      ## Install the project.
	python -m venv .venv

install:   ## do install
	python -m pip install -r .\requirements.txt

check_venv:
	@python -c "import sys; sys.exit(0) if sys.prefix != sys.base_prefix else sys.exit(1)" || (echo 'Please activate your virtual environment.' && exit 1)

activate:  ## Instructions to activate the virtual environment.
	@echo To activate the virtual environment, run:
	@echo For Command Prompt: .venv\Scripts\activate
	@echo For PowerShell: .venv\Scripts\Activate.ps1
	@echo for Bash: . .venv\bin\activate

run: check_venv ## Run the server.
	python server.py

test:      ## Run the tests.
	python stress_tests.py