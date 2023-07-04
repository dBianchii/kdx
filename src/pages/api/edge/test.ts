import { type NextRequest, NextResponse } from "next/server";
export const config = {
  runtime: "edge", // this is a pre-requisite
};

const testEdge = (request: NextRequest) => {
  return NextResponse.json({
    name: `Hello, from ${request.url} I'm now an Edge Function!`,
    ip: request.ip,
    location: request.geo,
  });
};

export default testEdge;
