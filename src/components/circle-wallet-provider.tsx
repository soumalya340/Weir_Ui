"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCookie, setCookie } from "cookies-next";
import type { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";
import {
  CIRCLE_CHAIN_LABEL,
  circleAppId,
  circleConfigured,
  googleClientId,
} from "@/lib/circle/config";

type LoginResult = {
  userToken: string;
  encryptionKey: string;
};

export type CircleWallet = {
  id: string;
  address: string;
  blockchain: string;
};

type CircleWalletContextValue = {
  configured: boolean;
  ready: boolean;
  status: string;
  error: string | null;
  authenticated: boolean;
  wallets: CircleWallet[];
  primaryWallet: CircleWallet | null;
  usdcBalance: string | null;
  connect: () => Promise<void>;
  createWallet: () => Promise<void>;
  logout: () => void;
};

const CircleWalletContext = createContext<CircleWalletContextValue | null>(null);

const SESSION_KEY = "weir-circle-session-v1";

function loadSession(): LoginResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoginResult;
  } catch {
    return null;
  }
}

function saveSession(session: LoginResult | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function CircleWalletProvider({ children }: { children: ReactNode }) {
  const sdkRef = useRef<W3SSdk | null>(null);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [wallets, setWallets] = useState<CircleWallet[]>([]);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const api = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const response = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }, []);

  const loadUsdcBalance = useCallback(
    async (userToken: string, walletId: string) => {
      const { ok, data } = await api("getTokenBalance", { userToken, walletId });
      if (!ok) return null;
      const balances = (data.tokenBalances as Array<{
        amount?: string;
        token?: { symbol?: string; name?: string };
      }>) || [];
      const usdc =
        balances.find((t) => {
          const symbol = t.token?.symbol || "";
          const name = t.token?.name || "";
          return symbol.startsWith("USDC") || name.includes("USDC");
        }) ?? null;
      const amount = usdc?.amount ?? "0";
      setUsdcBalance(amount);
      return amount;
    },
    [api],
  );

  const loadWallets = useCallback(
    async (userToken: string) => {
      const { ok, data } = await api("listWallets", { userToken });
      if (!ok) {
        setError(data.error || data.message || "Failed to list wallets");
        return;
      }
      const next = ((data.wallets as CircleWallet[]) || []).map((w) => ({
        id: w.id,
        address: w.address,
        blockchain: w.blockchain,
      }));
      setWallets(next);
      if (next[0]) await loadUsdcBalance(userToken, next[0].id);
      else setUsdcBalance(null);
    },
    [api, loadUsdcBalance],
  );

  useEffect(() => {
    if (!circleConfigured) {
      setReady(true);
      setStatus("Circle App ID not configured");
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

        const onLoginComplete = (err: unknown, result: unknown) => {
          if (cancelled) return;
          if (err || !result) {
            const message =
              (err as { message?: string } | null)?.message || "Google login failed";
            setError(message);
            setLoginResult(null);
            saveSession(null);
            setStatus("Login failed");
            return;
          }
          const payload = result as LoginResult;
          const session = {
            userToken: payload.userToken,
            encryptionKey: payload.encryptionKey,
          };
          setLoginResult(session);
          saveSession(session);
          setError(null);
          setStatus("Signed in with Google");
          void loadWallets(session.userToken);
        };

        const restoredDeviceToken = (getCookie("deviceToken") as string) || "";
        const restoredDeviceEncryptionKey =
          (getCookie("deviceEncryptionKey") as string) || "";
        const restoredGoogleClientId =
          (getCookie("google.clientId") as string) || googleClientId || "";

        const sdk = new W3SSdk(
          {
            appSettings: { appId: circleAppId },
            loginConfigs: {
              deviceToken: restoredDeviceToken,
              deviceEncryptionKey: restoredDeviceEncryptionKey,
              google: {
                clientId: restoredGoogleClientId,
                redirectUri: typeof window !== "undefined" ? window.location.origin : "",
                selectAccountPrompt: true,
              },
            },
          },
          onLoginComplete,
        );
        sdkRef.current = sdk;

        const cachedDevice =
          typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;
        const id = cachedDevice || (await sdk.getDeviceId());
        if (!cachedDevice && typeof window !== "undefined") {
          localStorage.setItem("deviceId", id);
        }
        if (!cancelled) {
          setDeviceId(id);
          setReady(true);
          setStatus("Circle SDK ready");
        }

        const existing = loadSession();
        if (existing?.userToken && !cancelled) {
          setLoginResult(existing);
          sdk.setAuthentication({
            userToken: existing.userToken,
            encryptionKey: existing.encryptionKey,
          });
          await loadWallets(existing.userToken);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setReady(true);
          setError("Failed to initialize Circle Web SDK");
          setStatus("SDK init failed");
        }
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadWallets]);

  const connect = useCallback(async () => {
    if (!circleConfigured) {
      setError("Set NEXT_PUBLIC_CIRCLE_APP_ID, CIRCLE_API_KEY, and NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }
    if (!googleClientId) {
      setError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID for Google social login");
      return;
    }
    const sdk = sdkRef.current;
    if (!sdk || !deviceId || busy) return;

    try {
      setBusy(true);
      setError(null);
      setStatus("Creating device token…");
      const { ok, data } = await api("createDeviceToken", { deviceId });
      if (!ok) {
        setError(data.error || data.message || "Failed to create device token");
        setStatus("Device token failed");
        return;
      }

      setCookie("deviceToken", data.deviceToken);
      setCookie("deviceEncryptionKey", data.deviceEncryptionKey);
      setCookie("appId", circleAppId);
      setCookie("google.clientId", googleClientId);

      sdk.updateConfigs({
        appSettings: { appId: circleAppId },
        loginConfigs: {
          deviceToken: data.deviceToken,
          deviceEncryptionKey: data.deviceEncryptionKey,
          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true,
          },
        },
      });

      setStatus("Redirecting to Google…");
      sdk.performLogin(SocialLoginProvider.GOOGLE);
    } catch (e) {
      console.error(e);
      setError("Connect failed");
      setStatus("Connect failed");
    } finally {
      setBusy(false);
    }
  }, [api, busy, deviceId]);

  const createWallet = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk || !loginResult || busy) return;

    try {
      setBusy(true);
      setError(null);
      setStatus(`Initializing ${CIRCLE_CHAIN_LABEL} wallet…`);
      const { ok, data } = await api("initializeUser", {
        userToken: loginResult.userToken,
      });

      if (!ok) {
        if (data.code === 155106) {
          await loadWallets(loginResult.userToken);
          setStatus(`Wallet already exists on ${CIRCLE_CHAIN_LABEL}`);
          return;
        }
        setError(data.error || data.message || "Initialize failed");
        setStatus("Initialize failed");
        return;
      }

      const challengeId = data.challengeId as string;
      sdk.setAuthentication({
        userToken: loginResult.userToken,
        encryptionKey: loginResult.encryptionKey,
      });
      setStatus("Approve wallet creation…");

      await new Promise<void>((resolve) => {
        sdk.execute(challengeId, (err) => {
          if (err) {
            setError((err as { message?: string }).message || "Challenge failed");
            setStatus("Challenge failed");
            resolve();
            return;
          }
          void (async () => {
            await new Promise((r) => setTimeout(r, 1500));
            await loadWallets(loginResult.userToken);
            setStatus(`${CIRCLE_CHAIN_LABEL} wallet ready`);
            resolve();
          })();
        });
      });
    } catch (e) {
      console.error(e);
      setError("Wallet creation failed");
      setStatus("Wallet creation failed");
    } finally {
      setBusy(false);
    }
  }, [api, busy, loadWallets, loginResult]);

  const logout = useCallback(() => {
    setLoginResult(null);
    setWallets([]);
    setUsdcBalance(null);
    saveSession(null);
    setStatus("Signed out");
    setError(null);
  }, []);

  const value = useMemo<CircleWalletContextValue>(
    () => ({
      configured: circleConfigured,
      ready,
      status,
      error,
      authenticated: Boolean(loginResult?.userToken),
      wallets,
      primaryWallet: wallets[0] ?? null,
      usdcBalance,
      connect,
      createWallet,
      logout,
    }),
    [
      ready,
      status,
      error,
      loginResult,
      wallets,
      usdcBalance,
      connect,
      createWallet,
      logout,
    ],
  );

  return (
    <CircleWalletContext.Provider value={value}>{children}</CircleWalletContext.Provider>
  );
}

export function useCircleWallet() {
  const ctx = useContext(CircleWalletContext);
  if (!ctx) {
    throw new Error("useCircleWallet must be used within CircleWalletProvider");
  }
  return ctx;
}
