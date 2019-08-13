# Contact Us

Creates a _Contact Site Owners_ button near the top right corner that opens an email to the site owners
## Pre-requisites:
- Requires [CITZ.IMB.SP.Libraries](../libraries) solution.

## Logic:
1. Looks for an Owners Group associated with the site and populates the _To:_ field with its members
2. If not 1, then looks up the site on the site inventory in the _Shared_ collection
3. If not 1 or 2, then uses the CITZ SharePoint support email address
