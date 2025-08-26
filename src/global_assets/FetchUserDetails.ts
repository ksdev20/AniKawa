const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryFUD(retries: number, delayMs: number): Promise<boolean> {
    if (retries > 0) {
        console.warn(`Retrying FUD... retries left : ${retries}`);
        await delay(delayMs);
        return await fetchUserDetails(retries - 1, delayMs);
    } else {
        console.warn("FUD failed after retries");
        return false;
    }
}

export default async function fetchUserDetails(retries =  3, delayMs = 1000) {
    try {
        const res = await fetch(`${backendUrl}/api/user`, {
            method: 'GET',
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success && data.userData && data.watchlist) {
                localStorage.setItem('userData', JSON.stringify(data.userData));
                localStorage.setItem('watchlist', JSON.stringify(data.watchlist));
                localStorage.setItem('history', JSON.stringify(data.history));
                localStorage.setItem('isLoggedIn', 'true');

                window.dispatchEvent(new Event("userDataUpdated"));
                return true;
            }
        }

        throw new Error("Bad response");
    } catch (e) {
        console.warn(`Error : ${e}. Retries left : ${retries}`);
        return await retryFUD(retries, delayMs);
    }
}

export async function checkCookie() {
    localStorage.clear();
    try {
        const res = await fetch(`${backendUrl}/api/checkCookie`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error("Response not ok");

        const data = await res.json();
        if (!data) throw new Error("Data undefined/null");

        if (data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            return true;
        } else {
            localStorage.setItem('isLoggedIn', 'false');
            return false;
        }
    } catch (e) {
        console.warn(e);
        localStorage.setItem('isLoggedIn', 'false');
        return false;
    }
}

export function setOnlyUserData(profileName: string, profilePic: string | null) {
    const userData = {
        profileName,
        profilePic
    }

    localStorage.setItem('userData', JSON.stringify(userData));
}