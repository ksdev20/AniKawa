export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function success(data: unknown, status = 200) {
  return json(
    {
      success: true,
      data,
    },
    status,
  );
}

export const badRequest = (error: string) =>
  json({ success: false, error }, 400);

export const unauthorized = (error: string) =>
  json({ success: false, error }, 401);

export const forbidden = (error: string) =>
  json({ success: false, error }, 403);

export const conflict = (error: string) => json({ success: false, error }, 409);

export const tooManyRequests = (error: string) =>
  json({ success: false, error }, 429);

export const serverError = (error: string) =>
  json({ success: false, error }, 500);

export const created = (data: unknown) => json({ success: true, data }, 201);

export const ok = (data: unknown) => json({ success: true, data }, 200);

export const notFound = (error: string) =>
  json({ success: false, error }, 404);