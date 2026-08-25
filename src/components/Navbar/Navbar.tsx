import "./navbartw.css";

import { useState, useEffect } from "react";

import { categoryItems, legalItems, npoItems } from "../../config/navItems";

import { Icon } from "../../icons/icons";

import AfterLoginNav from "./UserSidebar/AfterLoginNav";

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

import { useAuth } from "@/hooks/useAuth";

import { useLoginModalStore } from "@/global_assets/loginModalStore";
import {
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";

function getEl(id: string) {
  return document.getElementById(id);
}

const pd = (e: any) => e.preventDefault();
const sp = (e: any) => e.stopPropagation();

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catddOpen, setCatdd] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const isLoggedIn = !!user;

  // ✅ Disable scroll when sidebars open
  useEffect(() => {
    document.body.style.overflowY = menuOpen || personOpen ? "hidden" : "";
  }, [menuOpen, personOpen]);

  // ✅ Focus management
  useEffect(() => {
    if (menuOpen) getEl("sb-first-btn")?.focus();
    if (personOpen) getEl("person-first-btn")?.focus();
  }, [menuOpen, personOpen]);

  const closeFnPerson = (e: any) => {
    pd(e);
    getEl("person-menu")?.focus();
    setPersonOpen(false);
  };

  const closeFnSidebar = (e: any) => {
    pd(e);
    getEl("main-menu")?.focus();
    setMenuOpen(false);
    sp(e);
  };

  const closeFnCatdd = (e: any) => {
    pd(e);
    getEl("category-button")?.focus();
    setCatdd(false);
    sp(e);
  };

  const onKd = (handler: any, key: string) => {
    return (e: any) => {
      if (e.key === key) handler(e);
    };
  };

  const handleClickWatHis = async (name: string) => {
    if (name === "logout") {
      await logout();
      setPersonOpen(false);
      return;
    }

    if (name === "settings") {
      const pathname = window.location.pathname;

      const href = "/profile/settings";

      if (pathname === href) {
        setPersonOpen(false);
        return;
      }

      window.location.href = href;
      return;
    }

    if (name === "episodes history") {
      const href = "/history";
      window.location.href = href;
      return;
    }

    const href = `/${name}`;

    if (window.location.pathname === href) {
      setPersonOpen(false);
      return;
    }

    window.location.href = href;
  };

  return (
    <header>
      <nav className="navbar">
        <section className="nav-left" aria-label="Nav Left">
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
            <img
              src="/logo.webp"
              srcSet="/logo.webp 1x, /logo@2x.webp 2x"
              alt="Website Logo"
              className="website-logo"
            />
          </a>
        </section>
        <section className="nav-right" aria-label="Nav Right">
          <a aria-label="Search" className="nav-right-block" href="/search">
            <Icon name="search" />
          </a>
          <a
            aria-label="History"
            id="history-btn-index"
            className="nav-right-block w-navbar"
            href="/history"
          >
            <ClockCounterClockwiseIcon size={24} />
          </a>
          <button
            aria-label="Account Menu/Login-Signup Menu"
            className="nav-right-block"
            id="person-menu"
            onClick={() => {
              if (menuOpen) setMenuOpen(false);

              if (!isLoggedIn) {
                useLoginModalStore.getState().openLogin();
                return;
              }

              setPersonOpen(!personOpen);
            }}
          >
            <Icon name="person" />
          </button>
        </section>
      </nav>
      <div className="empty-top"></div>

      {/* Sidebar overlay */}
      <aside
        className={`sidebar-overlay ${menuOpen ? "show" : "hidden"}`}
        id="sidebar-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
        onKeyDown={onKd(closeFnSidebar, "Escape")}
      >
        <nav className="sidebar" id="sidebar" role="menubar">
          {npoItems.map((obj, i) => (
            <a
              key={i}
              role="menuitem"
              aria-label={`${obj.label} Anime List Page`}
              className="sidebar-button"
              href={obj.href}
              {...(i === 0 ? { id: "sb-first-btn" } : {})}
            >
              {obj.label}
            </a>
          ))}
          <button
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={catddOpen}
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
            onKeyDown={onKd(closeFnCatdd, "Escape")}
          >
            {categoryItems.map((cat, i) => (
              <a
                role="menuitem"
                key={i}
                href={`/category/${cat}`}
                className="catdd-btn"
              >
                {cat}
              </a>
            ))}
          </nav>
          {legalItems.map((obj, i) => (
            <a
              key={obj.idx}
              role="menuitem"
              className="sidebar-button"
              href={obj.href}
              onKeyDown={
                i === legalItems.length - 1
                  ? onKd(closeFnSidebar, "Tab")
                  : undefined
              }
            >
              {obj.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Login/Account overlay */}
      {isLoggedIn && (
        <aside
          className={`log-sign-overlay ${personOpen ? "show" : "hidden"}`}
          id="log-sign-overlay"
          onClick={(e) => {
            if (e.target == e.currentTarget) setPersonOpen(false);
          }}
          onKeyDown={onKd(closeFnPerson, "Escape")}
        >
          <AfterLoginNav
            closeFn={onKd(closeFnPerson, "Tab")}
            userData={profile}
            clickHandler={handleClickWatHis}
          />
        </aside>
      )}

      <SpeedInsights />
      <Analytics />
    </header>
  );
}
