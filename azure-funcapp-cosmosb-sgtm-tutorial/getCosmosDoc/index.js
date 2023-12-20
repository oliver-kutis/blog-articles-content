const { CosmosClient } = require("@azure/cosmos");

/**
 * Retrieves the container object from the Cosmos DB client.
 * 
 * @param {Object} client - The Cosmos DB client.
 * @param {Object} options - The options object.
 * 
 * @returns {Object} - The container object.
 */
const getContainer = (client, options) => {
    return client.database(options.database).container(options.container);
};

/**
 * Creates and executes a query based on the specified options object.
 * 
 * @param {string} endpoint - The Cosmos DB endpoint.
 * @param {string} key - The Cosmos DB access key.
 * @param {Object} options - The options object.
 * @param {Object} context - The context object.
 * 
 * @returns {void}
 */
const createQuery = async (endpoint, key, options, context) => {
    // Validate the options object to ensure all required parameters are present
    for (const param of ['database', 'container', 'documentId']) {
      try {
        if (!options[param]) {
            context.res = {
                status: 400, 
                send: `Bad Request: Missing required parameter: ${param}`
            }
        }
        if (typeof options[param] !== 'string') {
            context.res = {
                status: 400, 
                send: `Bad Request: Parameter ${param} must be a string`
            }
        }
        if (options[param].length === 0) {
            context.res = {
                status: 400, 
                send: `Bad Request: Parameter ${param} cannot be empty`
            }
        }
      } catch (error) {
        context.res = {
            status: 400, 
            send: `Bad Request: ${error.message}.`
        }
      }
    }

    // Create the Cosmos DB client
    const client = new CosmosClient({ endpoint, key });
    // Get the container object
    const container = getContainer(client, options);
  
    // Execute the query to retrieve the specified document
    try {
      const response = await container.item(options.documentId, options.partitionKey).read();
      context.res = {
        status: 200,
        body: response.resource
      };
    } catch (error) {
      console.error(error);
      context.res = {
        status: 500, 
        body: `Internal Server Error: ${error.message}`
      }
    }
};

/**
 * Azure Function App HTTP trigger for retrieving a document from a Cosmos DB container.
 * 
 * @param {Object} context - The Azure context object.
 * @param {Object} req - The request object.
 * 
 * @returns {void}
 * 
 * @example
 * 
 * // Request body
 * {
 *  "endpoint": "https://my-cosmos-db-account.documents.azure.com:443/",
 *  "key": "my-cosmos-db-account-access-key",
 *  "options": {
 *    "database": "my-database",
 *    "container": "my-container",
 *    "documentId": "my-document-id",
 *    "partitionKey": "my-partition-key"
 *  }
 * }
 * 
 * // Response body
 * {
 *  "id": "my-document-id",
 *  "name": "my-document-name",
 *  "value": "my-document-value"
 * }
*/
module.exports = async function(context, req) {
  // Validate the request body to ensure it contains the required parameters
  if (!req || !req.body) {
      context.res = {
        status: 400, 
        body: 'Bad Request: Missing request body'
      }
  }
  const { endpoint, key } = req.body;

  if (!endpoint || !key) {
    context.res = {
      status: 400, 
      body: 'Bad Request: Missing required parameters "endpoint" and/or "key"'
    }
  //   return;
  }

  // Get the options object from the request body
  const options = req.body.options || {};

  try {
    await createQuery(endpoint, key, options, context);
  } catch (error) {
    context.log(error);
    context.res = {
      status: 500, 
      body: `Internal Server Error: ${error.message}`
    
    };
  }
};