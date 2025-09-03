const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

const logout = () => {
    fetch(`${backendUrl}/api/logout`, {
        method: "POST",
        credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                console.log("Successfully logged out ✅");
                localStorage.clear();
                const loc = window.location;
                loc.pathname.includes("profile") ||
                    loc.pathname.includes("watchlist") ||
                    loc.pathname.includes("history")
                    ? (loc.href = "/")
                    : loc.reload();
            }
        })
        .catch((e) => {
            console.error(e.message);
        });
}

export default logout;