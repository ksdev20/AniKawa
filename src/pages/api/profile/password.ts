import type { APIRoute } from "astro";

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (password.length > 72) {
    return "Password cannot exceed 72 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain an uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain a lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain a number";
  }

  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
      },
    );
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return new Response(
      JSON.stringify({
        error: "Missing password fields",
      }),
      {
        status: 400,
      },
    );
  }

  const validation = validatePassword(newPassword);

  if (validation) {
    return new Response(
      JSON.stringify({
        error: validation,
      }),
      {
        status: 400,
      },
    );
  }

  if (currentPassword === newPassword) {
    return new Response(
      JSON.stringify({
        error: "New password must be different",
      }),
      {
        status: 400,
      },
    );
  }

  /*
    Verify current password
  */

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,

    password: currentPassword,
  });

  if (verifyError) {
    return new Response(
      JSON.stringify({
        error: "Current password is incorrect",
      }),
      {
        status: 400,
      },
    );
  }

  /*
    Update password
  */

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return new Response(
      JSON.stringify({
        error: updateError.message,
      }),
      {
        status: 500,
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      status: 200,
    },
  );
};
