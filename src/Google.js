var scope = "https://www.googleapis.com/auth/bigquery",
  gapi = window.gapi,
  authorizedEmails = [
    "jenessa.peterson@gmail.com",
    "kurt@renotype.com",
    "varun@opencurriculum.org"
  ],
  intendedOutputFilename = "voter_data2/Voters_out.csv",
  bucketPrefix = "https://storage.cloud.google.com/";

export const API_KEY = "AIzaSyBj7iiMWY5oeITwH9PMTMLLQc8srvx8c8Y";
export const CLIENT_ID =
  "450118682683-61sjkjihj0jd1d0sfh0sojdljsr4kaic.apps.googleusercontent.com";

export var tableId = "Voters";
export var joinTableId = "History";
export var projectId = "renotype";
export var datasetId = "Voter_Dataset_Complete";
export var location = "us-west2";

var Google = {
  load: function(buttonId) {
    return new Promise(function(resolve, reject) {
      gapi.load("client:auth2:signin2", function() {
        gapi.auth2
          .init({
            apiKey: API_KEY,
            scope: scope,
            client_id: CLIENT_ID
          })
          .then(function() {
            if (!gapi.auth2.getAuthInstance().isSignedIn.get())
              gapi.signin2.render(buttonId, {
                scope: scope,
                width: 300,
                height: 50,
                longtitle: true,
                theme: "light",
                onsuccess: () => {
                  Google.onSignedIn(resolve, reject);
                },
                onfailure: () => {
                  alert("Failure to log in");
                  reject();
                }
              });
            else {
              Google.onSignedIn(resolve, reject);
            }
          });
      });
    });
  },

  onSignedIn(resolve, reject) {
    // Turn down users who are not authorized.
    if (
      authorizedEmails.indexOf(
        gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getEmail()
      ) === -1
    ) {
      alert("Your user account is not authorized for this application");
      reject();
    }

    gapi.client
      .load("https://content.googleapis.com/discovery/v1/apis/bigquery/v2/rest")
      .then(
        function() {
          console.log("GAPI client loaded for API");
          resolve(
            gapi.auth2
              .getAuthInstance()
              .currentUser.get()
              .getBasicProfile()
          );
        },
        function(err) {
          console.error("Error loading GAPI client for API", err);
          reject();
        }
      );
  },

  getColumns: function() {
    return new Promise(function(resolve, reject) {
      gapi.client.bigquery.tables
        .get({
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        })
        .then(
          function(response) {
            // Handle the results here (response.result has the parsed body).
            resolve({
              fields: response.result.schema.fields,
              numRows: response.result.numRows
            });
            // console.log("Response", response);
          },
          function(err) {
            console.error("Execute error", err);
            reject(err);
          }
        );
    });
  },

  getCount: function(sql) {
    return new Promise(function(resolve, reject) {
      gapi.client.bigquery.jobs
        .query({
          projectId: projectId,
          resource: {
            query: sql,
            useLegacySql: false
          }
        })
        .then(
          function(response) {
            // Handle the results here (response.result has the parsed body).
            // response.rows[0][0]
            resolve(response.result.rows[0].f[0].v);
            //console.log("Response", response);
          },
          function(err) {
            console.error("Execute error", err);
            reject(err);
          }
        );
    });
  },

  export: function(sql) {
    return new Promise(function(resolve, reject) {
      // First, create a job.
      return gapi.client.bigquery.jobs
        .insert({
          projectId: projectId,
          resource: {
            configuration: {
              query: {
                query: sql,
                useLegacySql: false
              }
            }
          }
        })
        .then(
          function(response) {
            Google.onExportQueryInsert(response, resolve, reject);
          },
          function(err) {
            console.error("Execute error", err);
            reject(err);
          }
        );
    });
  },

  onExportQueryInsert(response, resolve, reject) {
    // Handle the results here (response.result has the parsed body).
    // console.log("Response", response);
    // Then keep setTimeout-ing every 4 seconds to see if there is a result.
    var jobCompletionInterval = setInterval(function() {
      Google.getQueryJobStatus(response.result.jobReference.jobId).then(
        function(jobComplete) {
          if (jobComplete) {
            clearInterval(jobCompletionInterval);

            // Then, create an export job.
            gapi.client.bigquery.jobs
              .insert({
                projectId: projectId,
                resource: {
                  configuration: {
                    extract: {
                      sourceTable:
                        response.result.configuration.query.destinationTable,
                      destinationUri: `gs://${intendedOutputFilename}`,
                      destinationFormat: "CSV"
                    }
                  }
                }
              })
              .then(
                function(response) {
                  Google.onExportJobInsert(response, resolve, reject);
                },
                function(err) {
                  console.error("Execute error", err);
                  reject(err);
                }
              );
          }
        }
      );
    }, 2000);
  },

  onExportJobInsert(response, resolve, reject) {
    // Then, keep timeout-ing every 4 seconds until that job is finished.
    var jobCompletionInterval = setInterval(function() {
      Google.getExtractJobStatus(response.result.jobReference.jobId).then(
        function(jobComplete) {
          if (jobComplete) {
            clearInterval(jobCompletionInterval);

            // Then, return the URL.
            resolve(`${bucketPrefix}${intendedOutputFilename}`);
          }
        }
      );
    }, 3000);
  },

  getQueryJobStatus(jobId) {
    return new Promise(function(resolve, reject) {
      return gapi.client.bigquery.jobs
        .getQueryResults({
          projectId: projectId,
          jobId: jobId,
          location: location,
          maxResults: 0
        })
        .then(
          function(response) {
            // Handle the results here (response.result has the parsed body).
            // response.results.status.state == 'DONE'
            // console.log("Response", response);
            resolve(response.result.jobComplete);
          },
          function(err) {
            console.error("Execute error", err);
            reject(err);
          }
        );
    });
  },

  getExtractJobStatus(jobId) {
    return new Promise(function(resolve, reject) {
      return gapi.client.bigquery.jobs
        .get({
          projectId: projectId,
          jobId: jobId,
          location: location
        })
        .then(
          function(response) {
            // Handle the results here (response.result has the parsed body).
            // response.results.status.state == 'DONE'
            // console.log("Response", response);
            resolve(response.result.status.state === "DONE");
          },
          function(err) {
            console.error("Execute error", err);
            reject(err);
          }
        );
    });
  }
};

export default Google;
