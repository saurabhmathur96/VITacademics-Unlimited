# VITacademics-Unlimited

[![CircleCI](https://circleci.com/gh/saurabhmathur96/VITacademics-Unlimited.svg?style=svg&circle-token=52f6f35b7462d0ef611b79a19faca7ebd75e41ff)](https://circleci.com/gh/saurabhmathur96/VITacademics-Unlimited)

VITacademics student-login API server

Find the API documentation [here](./API.md)


## Directory Structure

- `data` holds static files served directly.
- `schemas` holds structure of JSON objects returned by the API. The interfaces defined there are referenced in `API.md`. They are also used in unit and integration tests.
- `src/bin` holds executables and scripts.
- `src/middleware` holds custom middleware functions, grouped into files.
- `src/routes` holds routers, one per file.
- `src/scrapers` holds scraper functions. Each function takes a string representation of the html page as input and outputs either a JSON object or an Array of JSON objects.
- `src/utilities` holds various functions common to the entire project.
- `test` holds unit and integration tests.


_Note:_ `data/faculty_info.json` is a sample file for tests; it is replaced on deployment.
