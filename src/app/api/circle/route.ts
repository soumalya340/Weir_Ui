import { NextResponse } from "next/server";
import { CIRCLE_BLOCKCHAIN } from "@/lib/circle/config";

const CIRCLE_BASE_URL = process.env.NEXT_PUBLIC_CIRCLE_BASE_URL ?? "https://api.circle.com";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY ?? "";

async function circleFetch(
  path: string,
  init: RequestInit & { userToken?: string } = {},
) {
  const { userToken, headers: extraHeaders, ...rest } = init;
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: `Bearer ${CIRCLE_API_KEY}`,
    ...(extraHeaders as Record<string, string> | undefined),
  };
  if (userToken) headers["X-User-Token"] = userToken;

  const response = await fetch(`${CIRCLE_BASE_URL}${path}`, {
    ...rest,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function POST(request: Request) {
  if (!CIRCLE_API_KEY) {
    return NextResponse.json(
      { error: "Missing CIRCLE_API_KEY on the server" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { action, ...params } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "createDeviceToken": {
        const { deviceId } = params;
        if (!deviceId) {
          return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
        }
        const { response, data } = await circleFetch("/v1/w3s/users/social/token", {
          method: "POST",
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            deviceId,
          }),
        });
        if (!response.ok) return NextResponse.json(data, { status: response.status });
        return NextResponse.json(data.data, { status: 200 });
      }

      case "initializeUser": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json({ error: "Missing userToken" }, { status: 400 });
        }
        const { response, data } = await circleFetch("/v1/w3s/user/initialize", {
          method: "POST",
          userToken,
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            accountType: "SCA",
            blockchains: [CIRCLE_BLOCKCHAIN],
          }),
        });
        if (!response.ok) return NextResponse.json(data, { status: response.status });
        return NextResponse.json(data.data, { status: 200 });
      }

      case "listWallets": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json({ error: "Missing userToken" }, { status: 400 });
        }
        const { response, data } = await circleFetch("/v1/w3s/wallets", {
          method: "GET",
          userToken,
        });
        if (!response.ok) return NextResponse.json(data, { status: response.status });
        return NextResponse.json(data.data, { status: 200 });
      }

      case "getTokenBalance": {
        const { userToken, walletId } = params;
        if (!userToken || !walletId) {
          return NextResponse.json(
            { error: "Missing userToken or walletId" },
            { status: 400 },
          );
        }
        const { response, data } = await circleFetch(
          `/v1/w3s/wallets/${walletId}/balances`,
          { method: "GET", userToken },
        );
        if (!response.ok) return NextResponse.json(data, { status: response.status });
        return NextResponse.json(data.data, { status: 200 });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in /api/circle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
