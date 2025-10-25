const AliyunPhoneAuthClient = require('../utils/aliyun-client');
const { generateJWT, json, corsPreflight } = require('../utils/jwt');

// 简单的内存存储（生产环境建议使用数据库）
const users = new Map();

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return corsPreflight();
    }

    if (event.httpMethod !== 'POST') {
        return json(405, { message: 'Method Not Allowed' });
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { token, spToken } = body;

        if (!token && !spToken) {
            return json(400, { message: 'Token or spToken is required' });
        }

        // 验证阿里云 token 并获取手机号
        const client = new AliyunPhoneAuthClient();
        let verificationResult;
        
        if (spToken) {
            // 使用 spToken 获取手机号
            verificationResult = await client.getPhoneWithToken(spToken);
        } else {
            // 使用旧的 token 验证方式
            verificationResult = await client.verifyPhoneToken(token);
        }

        if (!verificationResult.success) {
            return json(400, { 
                message: verificationResult.message || 'Phone verification failed' 
            });
        }

        const phone = verificationResult.phone;

        // 查找或创建用户
        let user = users.get(phone);
        if (!user) {
            user = {
                userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                phone: phone,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                isMember: false,
                memberExpireAt: null,
                referredBy: null
            };
            users.set(phone, user);
        } else {
            // 更新最后登录时间
            user.lastLoginAt = new Date().toISOString();
            users.set(phone, user);
        }

        // 生成 JWT
        const jwt = generateJWT({
            userId: user.userId,
            phone: user.phone,
            isMember: user.isMember,
            memberExpireAt: user.memberExpireAt
        });

        // 返回用户信息和 JWT
        return json(200, {
            success: true,
            message: 'Login successful',
            jwt: jwt,
            user: {
                userId: user.userId,
                phone: user.phone,
                isMember: user.isMember,
                memberExpireAt: user.memberExpireAt,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });

    } catch (error) {
        console.error('Phone verification error:', error);
        return json(500, { 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

