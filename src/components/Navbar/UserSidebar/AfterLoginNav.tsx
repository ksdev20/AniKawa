import type { AfterLoginProps } from "../NavbarTs/navbar";

export function logout() {
  fetch("http://localhost:20000/api/logout", {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log("Successfully logged out ✅");
        localStorage.clear();
        const loc = window.location;
        loc.pathname.includes('profile') ? loc.href = '/' : loc.reload();
      }
    })
    .catch((e) => {
      console.error(e.message);
    });
}

export default function AfterLoginNav({ userData, clickHandler }: AfterLoginProps) {
  return (
    <nav
      id="after-login"
      className={`corner-box`}
    >
      <a
        aria-label="Profile Page"
        href="/profile"
        className="corner-box-btn cbb-account bd-bottom"
      >
        <div className="account-box">
          <img
            className="account-pic"
            src={
              userData?.profilePic ??
              "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg"
            }
            alt={`Profile picture of logged in user ${userData?.profileName}`}
            loading="lazy" decoding="async"
          />
          <div className="account-name">
            {userData?.profileName || "Username"}
          </div>
        </div>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          height="26px"
          viewBox="0 -960 960 960"
          width="26px"
          fill="#ffffff"
        >
          <path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" />
        </svg>
      </a>
      <button
        aria-label="Watchlist"
        id="watchlist-btn-person"
        className="corner-box-btn cbb-whl"
        onClick={() => {
          clickHandler("watchlist");
        }}
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          height="26px"
          viewBox="0 -960 960 960"
          width="26px"
          fill="#ffffff"
        >
          <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
        </svg>
        <div className="cbt-white">Watchlist</div>
      </button>
      <button
        aria-label="Watch History"
        id="history-btn-person"
        className="corner-box-btn cbb-whl bd-bottom"
        onClick={() => {
          clickHandler("history");
        }}
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          height="26px"
          viewBox="0 -960 960 960"
          width="26px"
          fill="#ffffff"
        >
          <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
        </svg>
        <div className="cbt-white">History</div>
      </button>
      <button
        aria-label="Logout"
        id="logout-btn-person"
        className="corner-box-btn cbb-whl"
        onClick={() => logout()}
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          height="26px"
          viewBox="0 -960 960 960"
          width="26px"
          fill="#ffffff"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
        </svg>
        <div className="cbt-white">Log Out</div>
      </button>
    </nav>
  );
}
