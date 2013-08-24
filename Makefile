SHELL  =bash
DATE   =$(shell +%Y-%m-%d@%H:%M)
CHECK  =\033[32m✔ Done\033[39m
FAILED =\033[01;31m✗ Failed\033[00;39m
HR     =\033[37m--------------------------------------------------\033[39m

PATH := ./bin:./node_modules/.bin:$(PATH)

all:
	@echo -e "${HR}"
	@echo -en "\033[01;30m# Build              ... \033[00m"
	@echo -e "${FAILED}"
	@echo "Please specify a build target"
	@exit 1

clean:
	@echo -e "${HR}"
	@echo -en "\033[01;30m# Cleaning           ... \033[00m"
	@rm -fr node_modules lib-cov report
	@echo -e "${CHECK}"

init: clean
	@echo -e "${HR}"
	@echo -e "\033[01;30m# Initializing       ... \033[00m"
	npm install
	@echo -e "\033[01;37m# Initializing       ... \033[00m${CHECK}"

test:
	@echo -e "${HR}"
	@echo -e "\033[01;30m# Running Tests      ... \033[00m"
	@echo -e "${HR}"
	buster-test
	@echo -e "\033[01;37m# Running Tests      ... \033[00m${CHECK}"

cov:
	@echo -e "${HR}"
	@echo -e "\033[01;30m# Coverage Report    ... \033[00m"
	@rm -fr lib-cov report
	@yacoco lib lib-cov
	@ENABLE_COV=1 buster-test -c test/buster-cov.js
	@yacoco --report lib lib-cov
	@genhtml lib-cov/coverage.lcov -o report
	@echo -e "\033[01;37m# Coverage Repot     ... \033[00m${CHECK}"

watch:
	buster autotest

.PHONY: clean init test cov watch
