const crypto = require('crypto');

function json(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            ...headers
        },
        body: JSON.stringify(body)
    };
}

function corsPreflight() {
    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: ''
    };
}

function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function signRequest(payload, secret) {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    return `${data}.${sig}`;
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return corsPreflight();
    if (event.httpMethod !== 'POST') return json(405, { message: 'Method Not Allowed' });

    const { SMS_HMAC_SECRET = '', DEBUG_SMS = '0' } = process.env;
    if (!SMS_HMAC_SECRET) return json(500, { message: 'Server not configured (SMS_HMAC_SECRET missing)' });

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        return json(400, { message: 'Invalid JSON' });
    }

    const phone = (body.phone || '').trim();
    // 简单大陆手机号校验: 1开头11位
    if (!/^1\d{10}$/.test(phone)) {
        return json(400, { message: '请输入有效的手机号' });
    }

    // 生成6位验证码
    const code = ('' + Math.floor(100000 + Math.random() * 900000));
    const expireAt = Date.now() + 5 * 60 * 1000; // 5分钟
    const nonce = crypto.randomBytes(8).toString('hex');

    const payload = {
        phone,
        codeHash: sha256(code + ':' + phone + ':' + nonce),
        expireAt,
        nonce
    };
    const requestId = signRequest(payload, SMS_HMAC_SECRET);

    // 发送短信（此处留空，生产请接入阿里云/腾讯云短信）
    // 为便于联调，DEBUG 下返回明文验证码；生产环境请关闭
    const resp = { requestId, cooldownSeconds: 60 };
    if (DEBUG_SMS === '1') resp.debugCode = code;

    return json(200, resp);
};







