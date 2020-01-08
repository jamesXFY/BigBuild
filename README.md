# Office of the Coordinator-General Victoria - Victoria's Big Build - Disruptions Map

An api-based map to display a list of filterable traffic disruptions.

## Building for Matrix

Note: this map has two separate instances: one on the bigbuild.vic.gov.au site, and one on the majorroads.vic.gov.au (URL TBD) site. You'll need to deploy to both sites.

Configuration is determined by this string in the html content: `<script>window.disruptionsSite = 'majorRoads';</script>` which is set in assets 226049 (bigbuild) and 306712 (roads).

To deploy changes to these sites:

1. `npm install`
1. `npm run build`
1. Grab the new copy of `build/disruptions.min.js` (and `styles/disruption.css` and between the `<!-- START MARKUP FROM MATRIX PARSE FILE -->` tags in `index.html` if necessary) and upload to  both Matrix sites.

Matrix asset ids at the time of writing:
```
Big build | Major Roads | Item
226043    | 306459      | html content (copy from index.html between the `<!-- START MARKUP FROM MATRIX PARSE FILE -->` tags)
226123    | 306937      | disruptions.min.js
226132    | 306917      | disruptions.css
226049    | 306712      | endpoint URL and JS inclusion
226057    | 306716      | CSS inclusion
```

## Installation

Run the node js service to start the mock API, and serve the static files.

1. `npm install`
1. `npm start`
1. `open http://localhost:8080/`

## Official API docs

- https://bigbuild.disruptions-app.com.au/api/
- https://bigbuild.disruptions-app.com.au/docs/

### Disruptions admin

We have limited access here, the most common thing you'll need to edit is icons (login details in lastpass/Shared-Ladoo - Team):
https://bigbuild.disruptions-app.com.au/admin/

### Staging API

- https://bigbuild-staging.disruptions-app.com.au/api/
- https://bigbuild-staging.disruptions-app.com.au/docs/

## Contacts

California Nguyen and Annie Louey are the main client contacts.

Ryan Veenstra at Urban Circus is the main point of contact for API support:
0409 571 802 / 1300 16 16 33
ryan.veenstra@urbancircus.com.au