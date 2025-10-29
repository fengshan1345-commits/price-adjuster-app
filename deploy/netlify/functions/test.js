const { json, corsPreflight } = require('./utils/jwt');

exports.handler = async (event) => {
    console.log('Test function called');
    
    if (event.httpMethod === 'OPTIONS') {
        return corsPreflight();
    }

    try {
        // 检查环境变量
        const envCheck = {
            ALIYUN_ACCESS_KEY_ID: !!process.env.ALIYUN_ACCESS_KEY_ID,
            ALIYUN_ACCESS_KEY_SECRET: !!process.env.ALIYUN_ACCESS_KEY_SECRET,
            ALIYUN_PHONE_SCENE_CODE: !!process.env.ALIYUN_PHONE_SCENE_CODE,
            JWT_SECRET: !!process.env.JWT_SECRET,
            CORS_ALLOW_ORIGIN: !!process.env.CORS_ALLOW_ORIGIN,
            NODE_ENV: process.env.NODE_ENV
        };

        return json(200, {
            success: true,
            message: 'Test function working',
            environment: envCheck,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Test function error:', error);
        return json(500, {
            success: false,
            message: 'Test function error',
            error: error.message
        });
    }
};




