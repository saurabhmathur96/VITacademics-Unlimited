# VITAcademics-Unlimited

[![CircleCI](https://circleci.com/gh/saurabhmathur96/VITAcademics-Unlimited.svg?style=svg&circle-token=52f6f35b7462d0ef611b79a19faca7ebd75e41ff)](https://circleci.com/gh/saurabhmathur96/VITAcademics-Unlimited)
ss
VITAcademics student-login API server

Find the API documentation [here](./API.md)


## Directory Structure

- `src/middleware` holds custom middleware functions, grouped into files.
- `src/scrapers` holds scraper functions. Each function takes a string representation of the html page as input and outputs either a JSON object or an Array of JSON objects.
- `src/routes` holds routers, one per file.
- `test` holds unit and integration tests.
