import { NextResponse } from "next/server";

type ApiErrorExtra = Record<string, unknown>;
type ApiSuccessData = Record<string, unknown>;

type ApiErrorArgs = {
  status: number;
  code: string;
  error: string;
  extra?: ApiErrorExtra;
};

type ApiSuccessOptions = {
  code?: string;
  status?: number;
  headers?: HeadersInit;
};

export function apiSuccess(data: ApiSuccessData = {}, options: ApiSuccessOptions = {}) {
  return NextResponse.json(
    {
      ok: true,
      code: options.code ?? "OK",
      ...(data ?? {}),
    },
    {
      status: options.status ?? 200,
      headers: options.headers,
    },
  );
}

export function apiError({ status, code, error, extra }: ApiErrorArgs) {
  return NextResponse.json(
    {
      ok: false,
      code,
      error,
      ...(extra ?? {}),
    },
    { status },
  );
}

export function badRequestError(error = "Invalid request.", extra?: ApiErrorExtra) {
  return apiError({ status: 400, code: "BAD_REQUEST", error, extra });
}

export function validationError(details: unknown, error = "Invalid request payload.") {
  return apiError({ status: 400, code: "VALIDATION_ERROR", error, extra: { details } });
}

export function unauthorizedError(error = "Unauthorized", extra?: ApiErrorExtra) {
  return apiError({ status: 401, code: "UNAUTHORIZED", error, extra });
}

export function paymentRequiredError(error: string, extra?: ApiErrorExtra) {
  return apiError({ status: 402, code: "PAYMENT_REQUIRED", error, extra });
}

export function forbiddenError(error = "Forbidden", extra?: ApiErrorExtra) {
  return apiError({ status: 403, code: "FORBIDDEN", error, extra });
}

export function notFoundError(error = "Not found", extra?: ApiErrorExtra) {
  return apiError({ status: 404, code: "NOT_FOUND", error, extra });
}

export function conflictError(error: string, extra?: ApiErrorExtra) {
  return apiError({ status: 409, code: "CONFLICT", error, extra });
}

export function unprocessableEntityError(error: string, extra?: ApiErrorExtra) {
  return apiError({ status: 422, code: "UNPROCESSABLE_ENTITY", error, extra });
}

export function internalServerError(error = "Internal server error.", extra?: ApiErrorExtra) {
  return apiError({ status: 500, code: "INTERNAL_ERROR", error, extra });
}

export function upstreamError(error: string, extra?: ApiErrorExtra) {
  return apiError({ status: 502, code: "UPSTREAM_ERROR", error, extra });
}

export function statusToErrorCode(status: number) {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 402:
      return "PAYMENT_REQUIRED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
      return "INTERNAL_ERROR";
    case 502:
      return "UPSTREAM_ERROR";
    case 503:
      return "SERVICE_UNAVAILABLE";
    case 504:
      return "GATEWAY_TIMEOUT";
    default:
      return status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST";
  }
}
