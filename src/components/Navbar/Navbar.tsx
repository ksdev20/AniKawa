import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "../../icons/icons";
import "../../styles/custom-utilities.css";
import "../../styles/config.css";
import "./navbartw.css";
import { type UserData, type RefNames } from "./NavbarTs/navbar";
import AfterLoginNav, { logout } from "./UserSidebar/AfterLoginNav";
import BeforeLoginNav from "./UserSidebar/BeforeLoginNav";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { categoryItems, legalItems, npoItems } from "./config/items";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catddOpen, setCatdd] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const navItemRefs = useRef<Array<HTMLElement>>([]);
  const sidebarItemRefs = useRef<Array<HTMLElement>>([]);
  const categoryRefs = useRef<Array<HTMLElement>>([]);

  function getCorrectArray(name: RefNames) {
    let arr: HTMLElement[] = [];
    switch (name) {
      case "navbar":
        arr = navItemRefs.current;
        break;
      case "sidebar":
        arr = sidebarItemRefs.current;
        break;
      case "category":
        arr = categoryRefs.current;
        break;
      default:
        console.error("name or arrays invalid.");
    }
    return arr;
  }

  const setRef = (i: number, name: RefNames) => {
    return useCallback((el: HTMLElement | null) => {
      const arr = getCorrectArray(name);
      if (el) {
        arr[i] = el;
      } else {
        delete arr[i];
      }
    }, []);
  };

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

  useEffect(() => {
    document.body.style.overflowY = menuOpen || personOpen ? "hidden" : "";
  }, [menuOpen, personOpen]);

  useEffect(() => {
    navItemRefs.current.forEach((el, idx) => {
      if (el) el.tabIndex = idx === 0 ? 0 : -1;
    });
  }, []);

  function closePopups() {
    [setCatdd, setMenuOpen, setPersonOpen].forEach((fn) => {
      fn(false);
    });
  }

  const escHandle = [
    {
      containerId: "sidebar-overlay",
      buttonId: "main-menu",
      closeFn: setMenuOpen,
    },
    {
      containerId: "category-dropdown",
      buttonId: "category-button",
      closeFn: setCatdd,
    },
  ];

  //support for escaping the dropdowns for kb users
  useEffect(() => {
    const cleapups: (() => void)[] = [];

    escHandle.forEach((obj) => {
      const { containerId, buttonId, closeFn } = obj;
      const button = document.getElementById(buttonId);
      const container = document.getElementById(containerId);
      if (!button || !container) return;

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;

        if (container.contains(document.activeElement)) {
          closeFn(false);
          button.focus();
          e.stopPropagation();
        }
      };

      container.addEventListener("keydown", handleEsc);
      cleapups.push(() => container.removeEventListener("keydown", handleEsc));
    });

    return () => {
      cleapups.forEach((cleanupFn) => cleanupFn());
    };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent, idx: number, name: RefNames) {
    const arr = getCorrectArray(name);
    const total = arr.length;
    let next = idx;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % total;
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + total) % total;
      e.preventDefault();
    }

    const nextEl = arr[next];
    if (nextEl) {
      arr.forEach((el, i) => {
        if (el) el.tabIndex = i === next ? 0 : -1;
      });
      nextEl.focus(); //main task of the whole function
    }
  }

  const handleClickWatHis = (name: string) => {
    const href = () => {
      if (!window.location.pathname.includes(name)) {
        window.location.href = "/" + name;
      } else {
        setPersonOpen(false);
      }
    };
    switch (name) {
      case "watchlist":
        href();
        break;
      case "history":
        href();
        break;
      case "logout":
        logout();
        break;
    }
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
      >
        <nav className="sidebar" id="sidebar" role="menubar">
          {npoItems.map((obj, i) => {
            const { label, href } = obj;
            return (
              <a
                key={i}
                role="menuitem"
                ref={setRef(i, "sidebar")}
                onKeyDown={(e) => handleKeyDown(e, i, "sidebar")}
                aria-label={`${label} Anime List Page`}
                className="sidebar-button"
                href={href}
              >
                {label}
              </a>
            );
          })}
          <button
            role="menuitem"
            ref={setRef(3, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 3, "sidebar")}
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
          >
            {categoryItems.map((cat, i) => {
              return (
                <a
                  role="menuitem"
                  key={i}
                  href={`/category/${cat}`}
                  className="catdd-btn"
                  ref={setRef(i, "category")}
                  onKeyDown={(e) => handleKeyDown(e, i, "category")}
                >
                  {cat}
                </a>
              );
            })}
          </nav>
          {legalItems.map((obj) => {
            const { idx, label, href } = obj;
            return (
              <a
                key={idx}
                role="menuitem"
                className="sidebar-button"
                href={href}
                ref={setRef(idx, "sidebar")}
                onKeyDown={(e) => handleKeyDown(e, idx, "sidebar")}
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
      >
        {isLoggedIn ? (
          <AfterLoginNav userData={userData} clickHandler={handleClickWatHis} />
        ) : (
          <BeforeLoginNav />
        )}
      </aside>
      <SpeedInsights />
      <Analytics />
    </header>
  );
}
