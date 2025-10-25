const { verifyJWTMiddleware, json, corsPreflight } = require('../utils/jwt');

// 简单的内存存储（与 verify-phone.js 共享）
const users = new Map();

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return corsPreflight();
    }

    if (event.httpMethod !== 'GET') {
        return json(405, { message: 'Method Not Allowed' });
    }

    // 验证 JWT
    const { payload, error } = verifyJWTMiddleware(event);
    if (error) {
        return error;
    }

    try {
        const { userId } = payload;

        // 从存储中查找用户（这里简化处理，实际应该从数据库查询）
        let user = null;
        for (const [phone, userData] of users.entries()) {
            if (userData.userId === userId) {
                user = userData;
                break;
            }
        }

        if (!user) {
            return json(404, { message: 'User not found' });
        }

        // 返回用户信息
        return json(200, {
            success: true,
            user: {
                userId: user.userId,
                phone: user.phone,
                isMember: user.isMember,
                memberExpireAt: user.memberExpireAt,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                referredBy: user.referredBy
            }
        });

    } catch (error) {
        console.error('Get user info error:', error);
        return json(500, { 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



