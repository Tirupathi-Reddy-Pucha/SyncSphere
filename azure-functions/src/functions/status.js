const { app } = require('@azure/functions');

app.http('status', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('⚡ Azure Functions: Status check endpoint pinged');
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                service: 'SyncSphere Serverless Azure Function App',
                app: 'func-syncsphere-2026',
                status: 'OPERATIONAL',
                architecture: 'Serverless Event-Driven (Consumption Tier Y1)',
                location: 'East Asia',
                runtime: 'Node.js 24 LTS Serverless Worker',
                triggers: [
                    {
                        name: 'processBlobUpload',
                        type: 'BlobTrigger',
                        targetContainer: 'workspace-assets/{name}',
                        purpose: 'Automated file processing, metadata extraction & Cosmos DB audit ingestion'
                    },
                    {
                        name: 'status',
                        type: 'HttpTrigger',
                        authLevel: 'anonymous',
                        purpose: 'Serverless health & status monitoring'
                    }
                ],
                linkedResources: {
                    storageAccount: 'stsyncsphere2026',
                    cosmosDb: 'cosmos-syncsphere-db',
                    appInsights: 'appi-syncsphere-2026'
                },
                timestamp: new Date().toISOString()
            })
        };
    }
});
