import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'open';
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        
        if (!fromDate || !toDate) {
            return NextResponse.json({ success: false, message: 'fromDate and toDate are required' }, { status: 400 });
        }
        
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Authorization header is required' }, { status: 401 });
        }
        
        const path = type === 'open' 
            ? '/api/TransformerAlert/open-alerts' 
            : '/api/TransformerAlert/alerts';
            
        // Construct multipart form-data payload manually
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const bodyParts = [];
        bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="fromDate"\r\n\r\n${fromDate}\r\n`);
        bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="toDate"\r\n\r\n${toDate}\r\n`);
        bodyParts.push(`--${boundary}--\r\n`);

        const bodyBuffer = Buffer.concat(bodyParts.map(p => Buffer.from(p)));
        
        return new Promise<NextResponse>((resolve) => {
            const options = {
                hostname: '148.66.153.35',
                port: 9092,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': bodyBuffer.length
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(NextResponse.json(parsed, { status: res.statusCode || 200 }));
                    } catch (e) {
                        resolve(NextResponse.json({ 
                            success: false, 
                            message: 'Invalid JSON response from backend', 
                            raw: data 
                        }, { status: 500 }));
                    }
                });
            });

            req.on('error', (e) => {
                resolve(NextResponse.json({ success: false, message: e.message }, { status: 500 }));
            });

            req.write(bodyBuffer);
            req.end();
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
