const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setLogin(val: string) {
  const set = val == "t" ? "true" : "false";
  localStorage.setItem("isLoggedIn", set);
}

function createEvent() {
  window.dispatchEvent(new Event("userDataUpdated"));
}

async function retryFUD(retries: number, delayMs: number): Promise<boolean> {
  if (retries > 0) {
    console.warn(`Retrying FUD... retries left : ${retries}`);
    await delay(delayMs);
    return await fetchUserDetails(retries - 1, delayMs);
  } else {
    createEvent();
    console.warn("FUD failed after retries");
    return false;
  }
}

export default async function fetchUserDetails(retries = 3, delayMs = 1000) {
  try {
    const res = await fetch(`${backendUrl}/api/user`, {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401) {
      setLogin("f");
      createEvent();
      return false;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.userData && data.watchlist) {
      localStorage.setItem("userData", JSON.stringify(data.userData));
      localStorage.setItem("watchlist", JSON.stringify(data.watchlist));
      localStorage.setItem("history", JSON.stringify(data.history));
      setLogin("t");

      createEvent();
      return true;
    }

    throw new Error("Bad response");
  } catch (e) {
    console.warn(`Error : ${e}. Retries left : ${retries}`);
    return await retryFUD(retries, delayMs);
  }
}

export function setOnlyUserData(
  profileName: string,
  profilePic: string | null,
) {
  const userData = {
    profileName,
    profilePic,
  };

  localStorage.setItem("userData", JSON.stringify(userData));
  createEvent();
}
