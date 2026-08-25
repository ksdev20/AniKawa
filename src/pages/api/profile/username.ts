import type { APIRoute } from "astro";

const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "support",
  "moderator",
  "mod",
  "anikawa",
  "official",
  "system",
];

function validateUsername(username: string) {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length > 20) {
    return "Username cannot exceed 20 characters";
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Only lowercase letters, numbers and underscores allowed";
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return "This username is reserved";
  }

  return null;
}

// CHECK USERNAME AVAILABILITY
export const GET: APIRoute = async ({ url, locals }) => {
  const username = url.searchParams.get("username");

  if (!username) {
    return new Response(
      JSON.stringify({
        error: "Username required",
      }),
      {
        status: 400,
      },
    );
  }

  const normalized = username.toLowerCase().trim();

  const validation = validateUsername(normalized);

  if (validation) {
    return new Response(
      JSON.stringify({
        available: false,
        reason: validation,
      }),
      {
        status: 200,
      },
    );
  }

  const supabase = locals.supabase;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  return new Response(
    JSON.stringify({
      available: !data,
    }),
    {
      status: 200,
    },
  );
};

// CHANGE USERNAME
export const PATCH: APIRoute = async ({ request, locals }) => {
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

  const { username } = await request.json();

  if (!username) {
    return new Response(
      JSON.stringify({
        error: "Username required",
      }),
      {
        status: 400,
      },
    );
  }

  const normalized = username.toLowerCase().trim();

  const validation = validateUsername(normalized);

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

  // Get current profile

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      username
      `,
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    return new Response(
      JSON.stringify({
        error: profileError.message,
      }),
      {
        status: 500,
      },
    );
  }

  // Same username

  if (profile.username === normalized) {
    return new Response(
      JSON.stringify({
        error: "This is already your username",
      }),
      {
        status: 400,
      },
    );
  }

  const monthAgo = new Date();

  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { count } = await supabase
    .from("username_history")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte("created_at", monthAgo.toISOString());

  if ((count ?? 0) >= 3) {
    return new Response(
      JSON.stringify({
        error: "You can only change your username 3 times every 30 days",
      }),
      {
        status: 400,
      },
    );
  }

  // Check availability

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  if (taken) {
    return new Response(
      JSON.stringify({
        error: "Username already taken",
      }),
      {
        status: 409,
      },
    );
  }

  // Save username history

  const { error: historyError } = await supabase
    .from("username_history")
    .insert({
      user_id: user.id,

      old_username: profile.username,

      new_username: normalized,
    });

  if (historyError) {
    return new Response(
      JSON.stringify({
        error: historyError.message,
      }),
      {
        status: 500,
      },
    );
  }

  // Update profile

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({
      username: normalized,
    })
    .eq("id", user.id)
    .select()
    .single();

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
      profile: data,
    }),
    {
      status: 200,
    },
  );
};
