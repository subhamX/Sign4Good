import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");

    if(!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }


    const [header, payload, signature] = code.split(".");


    // console.log(code)
    // // code is a jwt token
    // const jwt = decodeJwt(code);

    // console.log(jwt);

    console.log(header, payload, signature)

    const jwt = new TextEncoder().encode(code);


  return NextResponse.json({ code });
}