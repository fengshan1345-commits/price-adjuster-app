const { json, corsPreflight } = require('../utils/jwt');

exports.handler = async (event) => {
    console.log('Simple test function called');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    if (event.httpMethod === 'OPTIONS') {
        return corsPreflight();
    }

    try {
        console.log('Returning simple response...');
        return json(200, {
            success: true,
            message: 'Simple test working',
            timestamp: new Date().toISOString(),
            method: event.httpMethod,
            body: event.body
        });

    } catch (error) {
        console.error('Simple test error:', error);
        return json(500, {
            success: false,
            message: 'Simple test error',
            error: error.message
        });
    }
};




