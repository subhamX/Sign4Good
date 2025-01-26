import { NextResponse } from "next/server";



export default async function POST(req: Request) {
    const body = await req.json();
    console.log(body);
    return NextResponse.json({ message: 'Event received' });
}

