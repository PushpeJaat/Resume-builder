"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type CashfreeCheckoutMode = "production";
type CashfreeCheckoutFactory = (config: { mode: CashfreeCheckoutMode }) => {
  checkout: (payload: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: CashfreeCheckoutFactory;
  }
}

type SubscribeState = "idle" | "creating-order" | "checkout" | "verifying";

type CreateSubscriptionResponse = {
  alreadyPaid?: boolean;
  planActive?: boolean;
  redirectTo?: string;
  code?: string;
  orderId?: string;
  resumeId?: string;
  paymentSessionId?: string;
  mode?: CashfreeCheckoutMode;
  error?: string;
};

type VerifyOrderResponse = {
  paid?: boolean;
  orderStatus?: string;
  redirectTo?: string;
  code?: string;
  error?: string;
};

export function PricingSubscribeButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribeState, setSubscribeState] = useState<SubscribeState>("idle");

  const isBusy = subscribeState !== "idle";

  const buttonLabel =
    subscribeState === "creating-order"
      ? "Starting payment"
      : subscribeState === "checkout"
        ? "Opening payment"
        : subscribeState === "verifying"
          ? "Verifying payment"
          : "Subscribe Now";

  const loadCashfreeSdk = useCallback(async (): Promise<CashfreeCheckoutFactory> => {
    if (typeof window === "undefined") {
      throw new Error("Cashfree checkout is only available in browser.");
    }

    if (window.Cashfree) {
      return window.Cashfree;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-cashfree-sdk='true']");

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Could not load Cashfree SDK.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.dataset.cashfreeSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Cashfree SDK."));
      document.body.appendChild(script);
    });

    if (!window.Cashfree) {
      throw new Error("Cashfree SDK is unavailable.");
    }

    return window.Cashfree;
  }, []);

  const handleRedirectTo = useCallback(
    (payload: { error?: unknown; redirectTo?: unknown } | null, fallbackMessage: string) => {
      const redirectTo = typeof payload?.redirectTo === "string" ? payload.redirectTo : "";
      if (!redirectTo) {
        return false;
      }

      const message =
        typeof payload?.error === "string" && payload.error.trim().length > 0
          ? payload.error
          : fallbackMessage;
      toast.error(message);
      router.push(redirectTo);
      return true;
    },
    [router],
  );

  const handleSubscribe = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setSubscribeState("creating-order");

    try {
      const createResponse = await fetch("/api/payments/cashfree/create-subscription-order", {
        method: "POST",
      });

      const createPayload = (await createResponse.json().catch(() => null)) as
        | CreateSubscriptionResponse
        | null;

      if (!createResponse.ok) {
        if (handleRedirectTo(createPayload, "Please choose a plan to continue.")) {
          setSubscribeState("idle");
          return;
        }

        setSubscribeState("idle");
        toast.error(createPayload?.error || "Could not create payment order.");
        return;
      }

      if (createPayload?.alreadyPaid) {
        setSubscribeState("idle");
        toast.success("Your plan is already active.");
        router.push("/dashboard/templates");
        return;
      }

      if (!createPayload?.paymentSessionId || !createPayload.orderId || !createPayload.resumeId) {
        setSubscribeState("idle");
        toast.error("Payment session is missing. Please try again.");
        return;
      }

      const mode: CashfreeCheckoutMode = "production";
      const cashfreeFactory = await loadCashfreeSdk();
      const cashfree = cashfreeFactory({ mode });

      setSubscribeState("checkout");
      await cashfree.checkout({
        paymentSessionId: createPayload.paymentSessionId,
        redirectTarget: "_modal",
      });

      setSubscribeState("verifying");

      const verifyResponse = await fetch("/api/payments/cashfree/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: createPayload.resumeId,
          orderId: createPayload.orderId,
        }),
      });

      const verifyPayload = (await verifyResponse.json().catch(() => null)) as VerifyOrderResponse | null;

      if (!verifyResponse.ok) {
        if (handleRedirectTo(verifyPayload, "Please choose a plan to continue.")) {
          setSubscribeState("idle");
          return;
        }

        setSubscribeState("idle");
        toast.error(verifyPayload?.error || "Could not verify payment.");
        return;
      }

      if (!verifyPayload?.paid) {
        setSubscribeState("idle");
        toast.info("Payment is not completed yet. Please complete checkout to continue.");
        return;
      }

      toast.success("Subscription activated successfully.");
      setSubscribeState("idle");
      router.push("/dashboard/templates");
      router.refresh();
    } catch (error) {
      setSubscribeState("idle");
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(message);
    }
  }, [handleRedirectTo, loadCashfreeSdk, router, session?.user?.id, status]);

  return (
    <button
      type="button"
      onClick={() => void handleSubscribe()}
      disabled={isBusy || status === "loading"}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {buttonLabel}
    </button>
  );
}
