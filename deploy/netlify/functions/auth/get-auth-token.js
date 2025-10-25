const AliyunPhoneAuthClient = require('../utils/aliyun-client');
const { json, corsPreflight } = require('../utils/jwt');

exports.handler = async (event) => {
    console.log('get-auth-token function called');
    console.log('Event method:', event.httpMethod);
    console.log('Event body:', event.body);
    
    if (event.httpMethod === 'OPTIONS') {
        console.log('Returning CORS preflight');
        return corsPreflight();
    }

    if (event.httpMethod !== 'POST') {
        console.log('Method not allowed:', event.httpMethod);
        return json(405, { message: 'Method Not Allowed' });
    }

    try {
        console.log('Parsing request body...');
        const body = JSON.parse(event.body || '{}');
        const { sceneCode } = body;
        console.log('Scene code:', sceneCode);

        if (!sceneCode) {
            console.log('Scene code is required');
            return json(400, { message: 'Scene code is required' });
        }

        console.log('Creating AliyunPhoneAuthClient...');
        // 调用阿里云 GetAuthToken 接口
        const client = new AliyunPhoneAuthClient();
        console.log('Calling getAuthToken...');
        const authResult = await client.getAuthToken(sceneCode);
        console.log('Auth result:', JSON.stringify(authResult, null, 2));

        if (authResult.success) {
            console.log('Auth successful, returning tokens');
            return json(200, {
                success: true,
                accessToken: authResult.accessToken,
                jwtToken: authResult.jwtToken,
                message: 'Auth tokens generated successfully'
            });
        } else {
            console.log('Auth failed:', authResult.message);
            return json(400, { 
                message: authResult.message || 'Failed to get auth tokens' 
            });
        }

    } catch (error) {
        console.error('Get auth token error:', error);
        console.error('Error stack:', error.stack);
        return json(500, { 
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
