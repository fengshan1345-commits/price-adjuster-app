const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

function json(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            ...headers
        },
        body: JSON.stringify(body)
    };
}

function corsPreflight() {
    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
    };
}

// 生成 JWT
function generateJWT(payload) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + (7 * 24 * 60 * 60) // 7天过期
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 验证 JWT
function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        
        const [encodedHeader, encodedPayload, signature] = parts;
        
        // 验证签名
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        
        if (signature !== expectedSignature) {
            throw new Error('Invalid signature');
        }
        
        // 解析 payload
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        
        // 检查过期时间
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            throw new Error('Token expired');
        }
        
        return payload;
    } catch (error) {
        throw new Error(`JWT verification failed: ${error.message}`);
    }
}

// 从请求头获取 JWT
function getJWTFromHeader(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

// 验证 JWT 中间件
function verifyJWTMiddleware(event) {
    const token = getJWTFromHeader(event);
    if (!token) {
        return {
            error: json(401, { message: 'Authorization token required' })
        };
    }
    
    try {
        const payload = verifyJWT(token);
        return { payload };
    } catch (error) {
        return {
            error: json(401, { message: 'Invalid or expired token' })
        };
    }
}

// Base64 URL 编码
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Base64 URL 解码
function base64UrlDecode(str) {
    // 添加填充
    str += '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

module.exports = {
    generateJWT,
    verifyJWT,
    getJWTFromHeader,
    verifyJWTMiddleware,
    json,
    corsPreflight
};





