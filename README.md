# VITAcademics-Unlimited
VITAcademics student-login API server

Find the API documentation [here](./API.md)


## Directory Structure

- `src/middleware` holds custom middleware functions, grouped into files.
- `src/scrapers` holds scraper functions. Each function takes a string representation of the html page as input and outputs either a JSON object or an Array of JSON objects.
- `src/routes` holds routers, one per file.
- `test` holds unit and integration tests.
