import { check, fail } from 'k6';

// Papaparse for CSV parsing (https://www.papaparse.com/)
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// SharedArray provides a more memory-efficient way of dealing with potentially large CSV files
import { SharedArray } from 'k6/data';

export function loadFromCsv(path, column) {
  const data = new SharedArray(column, function () {
    return papaparse.parse(open(path), { header: true }).data;
  });

  return data.map((row) => row[column]);
}

export function verifyResponse({
  response,
  expectedStatus,
  expectedContent,
  failOnError,
  printOnError,
  doCheck = true,
  verbose = false,
  dynamicIds,
  dynamicIdPlaceholder = '[id]',
}) {
  if (response.status != 200) {
    //console.log(response.url + ' - ' + response.status + ' - ' + response.body)
  } 
  if (!response) throw 'No response object provided';
  if (!expectedStatus && !expectedContent) throw 'No expected status or content specified in call to verifyResponse for URL ' + response.url;

  if (Array.isArray(response)) {
    response.forEach((r) => {
      verify(
        r, 
        expectedStatus, 
        expectedContent,
        failOnError, 
        printOnError, 
        doCheck, 
        verbose, 
        dynamicIds, 
        dynamicIdPlaceholder);
    });
  } else {
    verify(
      response,
      expectedStatus, 
      expectedContent, 
      failOnError, 
      printOnError, 
      doCheck, 
      verbose, 
      dynamicIds,
      dynamicIdPlaceholder);
  }
}

function verify(
  response,
  expectedStatus,
  expectedContent,
  failOnError,
  printOnError,
  doCheck,
  verbose,
  dynamicIds,
  dynamicIdPlaceholder,
) {
  let url = response.url;
  let contentCheckResult, statusCheckResult;

  // replace dynamic IDs in the URL
  if (dynamicIds) {
    dynamicIds.forEach((dynamicId) => {
      if (response.url.includes(dynamicId)) {
        url = url.replace(dynamicId, dynamicIdPlaceholder);
      }
    });
  }

  // status check
  if (expectedStatus) {
    const statusText = `${response.request.method} ${url} status ${expectedStatus}`;
    statusCheckResult = expectedStatus.includes(response.status);

    if (doCheck) {
      check(response, {
        [statusText]: () => statusCheckResult
      });
    }

    if (statusCheckResult && verbose) console.debug(statusText);
  }

  // content check
  if (expectedContent) {
    const contentText = `"${expectedContent}" in ${url}`;

    try {
      contentCheckResult = response.body.includes(expectedContent);
    } catch (err) { // no response.body
      contentCheckResult = false;
    }

    if (doCheck) {
      check(response, {
        [contentText]: (r) => contentCheckResult,
      });
    }

    if (contentCheckResult && verbose) console.debug(contentText);
  }

  // if either check failed...
  if (typeof statusCheckResult !== 'undefined' && !statusCheckResult || !contentCheckResult && expectedContent) {
    // print the response body if it exists (timeouts won't have any)
    if (printOnError && response.body) console.warn("Unexpected response:\n" + response.body);

    if (failOnError) {
      // if both checks failed:
      if (!statusCheckResult && (!contentCheckResult && expectedContent)) {
        fail(`${response.request.method} ${url} unexpected status ${response.status} and "${expectedContent}" not found in response`);
      }
      else {
        if (!statusCheckResult && expectedStatus) {
          fail(`Received unexpected status code ${response.status} for URL: ${url}, expected ${expectedStatus}`);
        }
        else if (!contentCheckResult) {
          fail(`"${expectedContent}" not found in response for URL: ${url}`);
        }
      }
    }
  }
}
