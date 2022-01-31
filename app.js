const { CosmosClient } = require("@azure/cosmos");
const {ClientSecretCredential}= require("@azure/identity");

const endpoint = "https://medium-blog.documents.azure.com:443/";
const key = "Secret";

const servicePrincipal = new ClientSecretCredential(
    "8f12c261-6dbf-47c3-918f-1d15198a3b3b",
    "254a124e-9cb5-49b2-919d-faf8c141ac0a",
    "Secret")

//const cosmos_client = new CosmosClient({ endpoint, key });

const cosmos_client = new CosmosClient({endpoint,aadCredentials: servicePrincipal});


async function create(client, databaseId, containerId) {
  const partitionKey = "/id";

  /**
   * Create the database if it does not exist
   */
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  });
  console.log(`Created database:\n${database.id}\n`);

  /**
   * Create the container if it does not exist
   */
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey },
      { offerThroughput: 400 }
    );

  console.log(`Created container:\n${container.id}\n`);
}

async function main() {
  const database = cosmos_client.database("AzureSampleFamilyDatabase");
  const container = database.container("FamilyContainer");

  console.log(`Querying container: Items`);

// query to return all items
const querySpec = {
  query: "SELECT * from c"
};

// read all items in the Items container
const { resources: items } = await container.items
  .query(querySpec)
  .fetchAll();

items.forEach(item => {
  console.log(`${item.id} - ${item.description}`);
});


}

main().catch((error) => {
  console.error(error);
});
