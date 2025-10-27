const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Velix DVS API',
            version: '1.0.0',
            description: 'API documentation for Velix DVS project',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export default swaggerOptions;
