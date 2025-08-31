import "../../styles/config.css";
import "./navbartw.css";
import { useState, useEffect } from "react";
import { categoryItems, legalItems, npoItems } from "./config/items";
import { Icon } from "../../icons/icons";
import { type UserData } from "./NavbarTs/navbar";
import AfterLoginNav, { logout } from "./UserSidebar/AfterLoginNav";
import BeforeLoginNav from "./UserSidebar/BeforeLoginNav";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function getEl(id: string) {
  return document.getElementById(id);
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catddOpen, setCatdd] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  //check login status and update ui
  useEffect(() => {
    const loadUserData = () => {
      const isLogIn = localStorage.getItem("isLoggedIn") == "true";
      setLoggedIn(isLogIn);

      if (!isLogIn) return;
      const user = localStorage.getItem("userData");
      if (user) setUserData(JSON.parse(user));
    };

    loadUserData();

    window.addEventListener("userDataUpdated", loadUserData);

    return () => {
      window.removeEventListener("userDataUpdated", loadUserData);
    };
  }, []);

  //disable scroll on sidebar open
  useEffect(() => {
    document.body.style.overflowY = menuOpen || personOpen ? "hidden" : "";
  }, [menuOpen, personOpen]);

  //to focus on sidebar first button on its opening
  useEffect(() => {
    menuOpen ? getEl("sb-first-btn")?.focus() : null;
    personOpen ? getEl("person-first-btn")?.focus() : null;
  }, [menuOpen, personOpen]);

  //to close the sidebars on reaching respective last buttons and one tab click
  const closeFnPerson = (e: any) => {
    e.preventDefault();
    getEl("person-menu")?.focus();
    setPersonOpen(false);
  };

  const closeFnSidebar = (e: any) => {
    e.preventDefault();
    getEl("main-menu")?.focus();
    setMenuOpen(false);
    e.stopPropagation();
  };

  const closeFnCatdd = (e: any) => {
    e.preventDefault();
    getEl("category-button")?.focus();
    setCatdd(false);
    e.stopPropagation();
  };

  const handleClickWatHis = (name: any) => {
    const href = () => {
      if (!window.location.pathname.includes(name)) {
        window.location.href = "/" + name;
      } else {
        setPersonOpen(false);
      }
    };

    const clicks: Record<string, () => void> = {
      watchlist: href,
      history: href,
      logout: logout,
    };

    clicks[name]?.();
  };

  return (
    <header>
      <nav className="navbar">
        <div className="nav-left">
          <button
            aria-label="Open Menu"
            id="main-menu"
            className="nav-right-block"
            onClick={() => {
              if (personOpen) setPersonOpen(false);
              setMenuOpen(!menuOpen);
            }}
          >
            {menuOpen ? <Icon name="close" /> : <Icon name="menu" />}
          </button>
          <a aria-label="Homepage" href="/">
            <img src="/logo.png" alt="Website Logo" className="website-logo" />
          </a>
        </div>
        <div className="nav-right">
          <a aria-label="Search" className="nav-right-block" href="/search">
            <Icon name="search" />
          </a>
          <button
            aria-label="Watchlist"
            id="watchlist-btn-index"
            className="nav-right-block w-navbar"
            onClick={() => {
              if (isLoggedIn) window.location.href = "/watchlist";
            }}
          >
            <Icon name="watchlist" />
          </button>
          <button
            aria-label="Account Menu/Login-Signup Menu"
            className="nav-right-block"
            id="person-menu"
            onClick={() => {
              if (menuOpen) setMenuOpen(false);
              setPersonOpen(!personOpen);
            }}
          >
            <Icon name="person" />
          </button>
        </div>
      </nav>
      <div className="empty-top"></div>
      <aside
        className={`sidebar-overlay ${menuOpen ? "show" : "hidden"}`}
        id="sidebar-overlay"
        onClick={(e) => {
          if (e.target == e.currentTarget) setMenuOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key == "Escape") closeFnSidebar(e);
        }}
      >
        <nav className="sidebar" id="sidebar" role="menubar">
          {npoItems.map((obj, i) => {
            const { label, href } = obj;
            return (
              <a
                key={i}
                role="menuitem"
                aria-label={`${label} Anime List Page`}
                className="sidebar-button"
                href={href}
                {...(i == 0 ? { id: "sb-first-btn" } : {})}
              >
                {label}
              </a>
            );
          })}
          <button
            role="menuitem"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="dropdown-menu"
            aria-label="Open Categories Dropdown"
            className="sidebar-button category"
            id="category-button"
            onClick={() => setCatdd(!catddOpen)}
          >
            Categories
            {catddOpen ? <Icon name="keyup" /> : <Icon name="keydown" />}
          </button>
          <nav
            role="menu"
            className={`category-dropdown ${catddOpen ? "show" : "hidden"}`}
            id="category-dropdown"
            onKeyDown={(e) => {
              if (e.key == "Escape") closeFnCatdd(e);
            }}
          >
            {categoryItems.map((cat, i) => {
              return (
                <a
                  role="menuitem"
                  key={i}
                  href={`/category/${cat}`}
                  className="catdd-btn"
                >
                  {cat}
                </a>
              );
            })}
          </nav>
          {legalItems.map((obj, i) => {
            const { idx, label, href } = obj;
            const isLast = i == legalItems.length - 1;

            return (
              <a
                key={idx}
                role="menuitem"
                className="sidebar-button"
                href={href}
                onKeyDown={isLast ? closeFnSidebar : () => {}}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </aside>
      <aside
        className={`log-sign-overlay ${personOpen ? "show" : "hidden"}`}
        id="log-sign-overlay"
        onClick={(e) => {
          if (e.target == e.currentTarget) setPersonOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key == "Escape") closeFnPerson(e);
        }}
      >
        {isLoggedIn ? (
          <AfterLoginNav
            closeFn={closeFnPerson}
            userData={userData}
            clickHandler={handleClickWatHis}
          />
        ) : (
          <BeforeLoginNav />
        )}
      </aside>
      <SpeedInsights />
      <Analytics />
    </header>
  );
}
