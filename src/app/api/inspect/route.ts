import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("==================== INSPECT START ====================");
        console.log(`Source: ${body.source}`);
        console.log("==================== INSPECT END ======================");
        
        // Write to separate files based on the source
        const sourceName = body.source || 'default';
        const filePath = path.join(process.cwd(), `inspect_data_${sourceName}.json`);
        await fs.writeFile(filePath, JSON.stringify(body.data, null, 2), 'utf-8');
        
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Inspect API error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}


