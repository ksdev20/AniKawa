import { useState, useEffect, use } from 'react';
import { Menu, X } from 'lucide-react';
import '../../styles/config.css';
import './navbar.css';

interface userData {
    profileName: string,
    profilePic: string
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [catddOpen, setCatdd] = useState(false);
    const [personOpen, setPersonOpen] = useState(false);
    const [userData, setUserData] = useState<userData | null>(null);
    const [isLoggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const loadUserData = () => {
            const isLogIn = localStorage.getItem('isLoggedIn') == 'true';
            setLoggedIn(isLogIn);
            
            if (!isLogIn) return;
            const user = localStorage.getItem('userData');
            if (user) setUserData(JSON.parse(user));
        }

        loadUserData();

        window.addEventListener('userDataUpdated', loadUserData);

        return () => {
            window.removeEventListener('userDataUpdated', loadUserData);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflowY = menuOpen || personOpen ? 'hidden' : '';
    }, [menuOpen, personOpen]);

    const categories = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Music", "Romance", "Sci-Fi", "Sports", "Supernatural", "Thriller"];

    function logout() {
        fetch('http://localhost:20000/api/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Successfully logged out ✅");
                    localStorage.clear();
                    window.location.reload();
                }
            })
            .catch(e => {
                console.error(e.message);
            })
    }

    const handleClickWatHis = (name: string) => {
        window.location.pathname.includes(name) ? setPersonOpen(false) : window.location.href = '/' + name;
    }

    return (
        <header>
            <div className="navbar">
                <div className="nav-left">
                    <button id="main-menu" className="nav-right-block" onClick={() => {
                        if (personOpen) setPersonOpen(false);
                        setMenuOpen(!menuOpen)
                    }}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <a href='/'><img src="/logo.png" alt="website-logo" className="website-logo" /></a>
                </div>
                <div className="nav-right">
                    <a className="nav-right-block" href="/search">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ffffff"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    </a>
                    <a id="watchlist-btn-index" className="nav-right-block w-navbar" onClick={() => {
                        if (isLoggedIn) window.location.href = '/watchlist';
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ffffff"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" /></svg>
                    </a>
                    <button className="nav-right-block" id="person-menu" onClick={() => {
                        if (menuOpen) setMenuOpen(false);
                        setPersonOpen(!personOpen);
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ffffff"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" /></svg>
                    </button>
                </div>
            </div>
            <div className="empty-top"></div>
            <div className={`sidebar-overlay ${menuOpen ? 'show' : 'hidden'}`} id="sidebarOverlay" onClick={(e) => {
                if (e.target == e.currentTarget) setMenuOpen(false);
            }}>
                <div className="sidebar" id="sidebar">
                    <a className="sidebar-button" href='/list/new'>New</a>
                    <a className="sidebar-button" href='/list/old'>Old</a>
                    <a className="sidebar-button" href='/list/popular'>Popular</a>
                    <div className="sidebar-button category" id="category-button" onClick={() => setCatdd(!catddOpen)}>
                        Category
                        <svg id="category-arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                            width="24px" fill="#ffffff">
                            <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                        </svg>
                    </div>
                    <div className={`category-dropdown ${catddOpen ? 'show' : 'hidden'}`} id="category-dropdown">
                        {categories.map((cat, i) => {
                            return (
                                <a key={i} href={`/category/${cat}`} className='catdd-btn'>{cat}</a>
                            )
                        })}
                    </div>
                    <a className="sidebar-button bd-top" href="/legal/about/">About Us</a>
                    <a className="sidebar-button" href="/legal/tos/" target="_blank">Terms of Service</a>
                    <a className="sidebar-button" href="/legal/privacy-policy/" target='_blank'>Privacy Policies</a>
                    <a className="sidebar-button" href="/legal/credits/">Credits</a>
                </div>
            </div>
            <div className={`log-sign-overlay ${personOpen ? 'show' : 'hidden'}`} id="log-sign-overlay" onClick={(e) => {
                if (e.target == e.currentTarget) setPersonOpen(false);
            }}>
                <div id="before-login" className={`corner-box ${isLoggedIn ? 'hidden' : ''}`}>
                    <a className="corner-box-btn" id="signup-btn" href="/signup/">
                        <div className="corner-box-btn-text">
                            <div className="cbt-white">Create Account</div>
                            <div className="cbt-gray">Join for free !</div>
                        </div>
                    </a>
                    <a className="corner-box-btn" id="login-btn" href="/login/">
                        <div className="corner-box-btn-text">
                            <div className="cbt-white">Log In</div>
                            <div className="cbt-gray">Already joined Frunchyroll? Welcome Back.</div>
                        </div>
                    </a>
                </div>
                <div id="after-login" className={`corner-box ${isLoggedIn ? '' : 'hidden'}`}>
                    <a href="/profile" className="corner-box-btn cbb-account bd-bottom">
                        <div className="account-box">
                            <img className="account-pic"
                                src={userData?.profilePic ?? "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg"} />
                            <div className="account-name">{userData?.profileName || 'Username'}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px"
                            fill="#ffffff">
                            <path
                                d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" />
                        </svg>
                    </a>
                    <a id="watchlist-btn-person" className="corner-box-btn cbb-whl" onClick={() => {handleClickWatHis('watchlist')}}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px"
                            fill="#ffffff">
                            <path
                                d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                        </svg>
                        <div className="cbt-white">Watchlist</div>
                    </a>
                    <a id="history-btn-person" className="corner-box-btn cbb-whl bd-bottom" onClick={() => {handleClickWatHis('history')}}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px"
                            fill="#ffffff">
                            <path
                                d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
                        </svg>
                        <div className="cbt-white">History</div>
                    </a>
                    <div id="logout-btn-person" className="corner-box-btn cbb-whl" onClick={() => logout()}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px"
                            fill="#ffffff">
                            <path
                                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                        </svg>
                        <div className="cbt-white">Log Out</div>
                    </div>
                </div>
            </div>
        </header>
    )
}