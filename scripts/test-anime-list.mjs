import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("\n❌ Missing Supabase environment variables.\n");

  console.error("Required in .env:");
  console.error("PUBLIC_SUPABASE_URL=...");
  console.error("PUBLIC_SUPABASE_ANON_KEY=...\n");

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Supabase
|--------------------------------------------------------------------------
*/

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/*
|--------------------------------------------------------------------------
| CLI
|--------------------------------------------------------------------------
*/

const rl = readline.createInterface({
  input,
  output,
});

function separator(title) {
  console.log("\n");
  console.log("=".repeat(70));
  console.log(title);
  console.log("=".repeat(70));
}

function printResult(data, error) {
  if (error) {
    console.error("\n❌ ERROR");
    console.error(error);
    return false;
  }

  console.log("\n✅ SUCCESS");

  console.dir(data, {
    depth: null,
    colors: true,
  });

  return true;
}

async function ask(question) {
  return (await rl.question(question)).trim();
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

async function login() {
  separator("LOGIN");

  const email = await ask("Supabase email: ");
  const password = await ask("Supabase password: ");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("\n❌ Login failed");
    console.error(error);
    process.exit(1);
  }

  if (!data.user || !data.session) {
    console.error("\n❌ Login succeeded but no session was returned.");

    process.exit(1);
  }

  console.log("\n✅ Logged in");
  console.log("User ID:", data.user.id);
  console.log("Email:", data.user.email);

  return data.user;
}

/*
|--------------------------------------------------------------------------
| GET PUBLIC ANIME LIST
|--------------------------------------------------------------------------
*/

async function getPublicList(username) {
  separator(`GET PUBLIC ANIME LIST — ${username}`);

  const { data, error } = await supabase.rpc("rpc_get_public_anime_list", {
    p_username: username,
  });

  printResult(data, error);

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| ADD / UPSERT
|--------------------------------------------------------------------------
*/

async function addAnime(animeNanoid) {
  separator(`ADD ANIME — ${animeNanoid}`);

  const { data, error } = await supabase.rpc("rpc_upsert_my_anime_list", {
    p_anime_nanoid: animeNanoid,
    p_status: "watching",
    p_progress: 1,
    p_score: null,
    p_started_at: new Date().toISOString(),
    p_completed_at: null,
    p_notes: "RPC test entry",
  });

  printResult(data, error);

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

async function updateAnime(animeNanoid) {
  separator(`UPDATE ANIME — ${animeNanoid}`);

  const { data, error } = await supabase.rpc("rpc_upsert_my_anime_list", {
    p_anime_nanoid: animeNanoid,
    p_status: "completed",
    p_progress: 13,
    p_score: 8.5,
    p_started_at: new Date().toISOString(),
    p_completed_at: new Date().toISOString(),
    p_notes: "Updated successfully through RPC",
  });

  printResult(data, error);

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {
  try {
    separator("ANIME LIST RPC TEST");

    console.log("Supabase:", SUPABASE_URL);

    /*
    |--------------------------------------------------------------------------
    | 1. LOGIN
    |--------------------------------------------------------------------------
    */

    const user = await login();

    /*
    |--------------------------------------------------------------------------
    | 2. PROFILE USERNAME
    |--------------------------------------------------------------------------
    */

    const username = await ask("\nPublic profile username to test: ");

    /*
    |--------------------------------------------------------------------------
    | 3. ANIME
    |--------------------------------------------------------------------------
    */

    const animeNanoid = await ask("Anime nanoid to test: ");

    /*
    |--------------------------------------------------------------------------
    | 4. GET BEFORE
    |--------------------------------------------------------------------------
    */

    await getPublicList(username);

    /*
    |--------------------------------------------------------------------------
    | 5. ADD
    |--------------------------------------------------------------------------
    */

    await addAnime(animeNanoid);

    /*
    |--------------------------------------------------------------------------
    | 6. GET AFTER ADD
    |--------------------------------------------------------------------------
    */

    await getPublicList(username);

    /*
    |--------------------------------------------------------------------------
    | 7. UPDATE
    |--------------------------------------------------------------------------
    */

    await updateAnime(animeNanoid);

    /*
    |--------------------------------------------------------------------------
    | 8. GET AFTER UPDATE
    |--------------------------------------------------------------------------
    */

    await getPublicList(username);

    /*
    |--------------------------------------------------------------------------
    | 9. DELETE
    |--------------------------------------------------------------------------
    */

    // const deleted = await deleteAnime(animeNanoid);

    // if (deleted === true) {
    //   console.log("\n✅ Delete confirmed.");
    // } else {
    //   console.log("\n⚠️ Delete returned false.");
    // }

    /*
    |--------------------------------------------------------------------------
    | 10. FINAL GET
    |--------------------------------------------------------------------------
    */

    await getPublicList(username);

    /*
    |--------------------------------------------------------------------------
    | DONE
    |--------------------------------------------------------------------------
    */

    separator("ALL TESTS FINISHED");

    console.log(`
User:
  ${user.email}

Username:
  ${username}

Anime:
  ${animeNanoid}

Flow:
  GET
    ↓
  ADD
    ↓
  GET
    ↓
  UPDATE
    ↓
  GET
    ↓
  DELETE
    ↓
  GET
`);
  } catch (error) {
    console.error("\n");
    console.error("=".repeat(70));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(70));

    console.error(error);

    process.exitCode = 1;
  } finally {
    rl.close();

    await supabase.auth.signOut();
  }
}

main();
