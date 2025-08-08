import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactEventHandler,
} from "react";
import { Menu, X } from "lucide-react";
import "../../styles/config.css";
import "./navbar.css";
import { type ALNames, type UserData, type RefNames } from "./NavbarTs/navbar";
import AfterLoginNav from "./UserSidebar/AfterLoginNav";
import BeforeLoginNav from "./UserSidebar/BeforeLoginNav";

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
      cleapups.forEach(cleanupFn => cleanupFn());
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

  const categories = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Music",
    "Romance",
    "Sci-Fi",
    "Sports",
    "Supernatural",
    "Thriller",
  ];

  const handleClickWatHis = (name: ALNames) => {
    window.location.pathname.includes(name)
      ? setPersonOpen(false)
      : (window.location.href = "/" + name);
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
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <a aria-label="Homepage" href="/">
            <img src="/logo.png" alt="Website Logo" className="website-logo" />
          </a>
        </div>
        <div className="nav-right">
          <a aria-label="Search" className="nav-right-block" href="/search">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#ffffff"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </a>
          <button
            aria-label="Watchlist"
            id="watchlist-btn-index"
            className="nav-right-block w-navbar"
            onClick={() => {
              if (isLoggedIn) window.location.href = "/watchlist";
            }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#ffffff"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
            </svg>
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
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#ffffff"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
            </svg>
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
          <a
            role="menuitem"
            ref={setRef(0, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 0, "sidebar")}
            aria-label="New Anime List Page"
            className="sidebar-button"
            href="/list/new"
          >
            New
          </a>
          <a
            role="menuitem"
            ref={setRef(1, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 1, "sidebar")}
            aria-label="Old Anime List Page"
            className="sidebar-button"
            href="/list/old"
          >
            Old
          </a>
          <a
            role="menuitem"
            ref={setRef(2, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 2, "sidebar")}
            aria-label="Popular Anime List Page"
            className="sidebar-button"
            href="/list/popular"
          >
            Popular
          </a>
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
            <svg
              aria-hidden="true"
              id="category-arrow"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#ffffff"
            >
              <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
            </svg>
          </button>
          <nav
            className={`category-dropdown ${catddOpen ? "show" : "hidden"}`}
            id="category-dropdown"
          >
            {categories.map((cat, i) => {
              return (
                <a
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
          <a
            role="menuitem"
            className="sidebar-button bd-top"
            href="/legal/about/"
            ref={setRef(4, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 4, "sidebar")}
          >
            About Us
          </a>
          <a
            role="menuitem"
            className="sidebar-button"
            href="/legal/tos/"
            target="_blank"
            ref={setRef(5, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 5, "sidebar")}
          >
            Terms of Service
          </a>
          <a
            role="menuitem"
            className="sidebar-button"
            href="/legal/privacy-policy/"
            target="_blank"
            ref={setRef(6, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 6, "sidebar")}
          >
            Privacy Policies
          </a>
          <a
            role="menuitem"
            className="sidebar-button"
            href="/legal/credits/"
            ref={setRef(7, "sidebar")}
            onKeyDown={(e) => handleKeyDown(e, 7, "sidebar")}
          >
            Credits
          </a>
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
    </header>
  );
}
