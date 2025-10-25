const crypto = require('crypto');

const ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID;
const ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET;
const SCENE_CODE = process.env.ALIYUN_PHONE_SCENE_CODE;

if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !SCENE_CODE) {
    throw new Error('Missing required environment variables: ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_PHONE_SCENE_CODE');
}

// 阿里云号码认证 API 客户端
class AliyunPhoneAuthClient {
    constructor() {
        this.endpoint = 'https://dypnsapi.aliyuncs.com';
        this.apiVersion = '2017-05-25';
        this.accessKeyId = ACCESS_KEY_ID;
        this.accessKeySecret = ACCESS_KEY_SECRET;
    }

    // 生成签名
    generateSignature(params, method = 'POST') {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const stringToSign = `${method}&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
        
        return crypto
            .createHmac('sha1', this.accessKeySecret + '&')
            .update(stringToSign)
            .digest('base64');
    }

    // 调用阿里云 API
    async callAPI(action, params) {
        const commonParams = {
            'Format': 'JSON',
            'Version': this.apiVersion,
            'AccessKeyId': this.accessKeyId,
            'SignatureMethod': 'HMAC-SHA1',
            'Timestamp': new Date().toISOString(),
            'SignatureVersion': '1.0',
            'SignatureNonce': Math.random().toString(36).substring(2, 15),
            'Action': action,
            ...params
        };

        const signature = this.generateSignature(commonParams);
        commonParams.Signature = signature;

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: Object.keys(commonParams)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(commonParams[key])}`)
                .join('&')
        });

        console.log('Aliyun API response status:', response.status);
        console.log('Aliyun API response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Aliyun API response body:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error(`Aliyun API returned non-JSON response: ${responseText.substring(0, 200)}...`);
        }
        
        if (result.Code && result.Code !== 'OK') {
            throw new Error(`Aliyun API Error: ${result.Code} - ${result.Message}`);
        }

        return result;
    }

    // 验证手机号 token 并获取真实手机号
    async verifyPhoneToken(accessToken) {
        try {
            const params = {
                'AccessToken': accessToken,
                'RegionId': 'cn-hangzhou'
            };

            const result = await this.callAPI('GetMobile', params);
            
            if (result.Code === 'OK' && result.Mobile) {
                return {
                    success: true,
                    phone: result.Mobile,
                    message: 'Phone verification successful'
                };
            } else {
                return {
                    success: false,
                    message: result.Message || 'Phone verification failed'
                };
            }
        } catch (error) {
            console.error('Aliyun phone verification error:', error);
            return {
                success: false,
                message: error.message || 'Phone verification service error'
            };
        }
    }

    // 获取认证Token（服务端调用）
    async getAuthToken(sceneCode) {
        try {
            const params = {
                'SceneCode': sceneCode,
                'RegionId': 'cn-hangzhou'
            };

            const result = await this.callAPI('GetAuthToken', params);
            
            if (result.Code === 'OK' && result.AccessToken && result.JwtToken) {
                return {
                    success: true,
                    accessToken: result.AccessToken,
                    jwtToken: result.JwtToken,
                    message: 'Auth tokens generated successfully'
                };
            } else {
                return {
                    success: false,
                    message: result.Message || 'Failed to get auth tokens'
                };
            }
        } catch (error) {
            console.error('Get auth token error:', error);
            return {
                success: false,
                message: error.message || 'Get auth token service error'
            };
        }
    }

    // 使用 spToken 获取手机号
    async getPhoneWithToken(spToken) {
        try {
            const params = {
                'SpToken': spToken,
                'RegionId': 'cn-hangzhou'
            };

            const result = await this.callAPI('GetPhoneWithToken', params);
            
            if (result.Code === 'OK' && result.PhoneNumber) {
                return {
                    success: true,
                    phone: result.PhoneNumber,
                    message: 'Phone number retrieved successfully'
                };
            } else {
                return {
                    success: false,
                    message: result.Message || 'Failed to get phone number'
                };
            }
        } catch (error) {
            console.error('Get phone with token error:', error);
            return {
                success: false,
                message: error.message || 'Get phone with token service error'
            };
        }
    }

    // 一键登录 - 获取 access token（前端调用）
    getAuthUrl() {
        const params = {
            'SceneCode': SCENE_CODE,
            'ResponseType': 'code',
            'State': 'login'
        };
        
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return `https://dypnsapi.aliyuncs.com/oauth/authorize?${queryString}`;
    }
}

module.exports = AliyunPhoneAuthClient;

