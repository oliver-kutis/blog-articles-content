curl -X POST https://myfunctionUrl/api/myFunctionName \
-H "Content-Type: application/json" \
-d '{
  "endpoint": "https://my-cosmos-db-url.documents.azure.com:443/",
  "key": "my-cosmos-db-primary-key",
  "options": {
    "database": "ToDoList",
    "container": "Items",
    "documentId": "Wakefield.7",
    "partitionKey": "Italy"
  }
}'