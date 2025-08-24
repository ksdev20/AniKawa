const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default async function fetchUserDetails() {
    console.log("FetchUserDetails called.");
    if (localStorage.getItem('isLoggedIn') == 'false') return;
    try {
        console.log("Database fetch made.");
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
            }
        }
    } catch (e) {
        console.warn("Error : ", e);
    }
}

export async function checkCookie(){
    try{
        const res = await fetch(`${backendUrl}/api/checkCookie`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error("Response not ok");

        const data = await res.json();
        if (!data) throw new Error("Data undefined/null");

        if (data.success){
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            localStorage.clear();
            localStorage.setItem('isLoggedIn', 'false');
        }
    } catch (e){
        console.warn(e);
        localStorage.setItem('isLoggedIn', 'false');
    }
}

export function setOnlyUserData(profileName: string, profilePic: string | null) {
    const userData = {
        profileName,
        profilePic
    }

    localStorage.setItem('userData', JSON.stringify(userData));
}