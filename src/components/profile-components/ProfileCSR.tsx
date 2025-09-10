import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { type Character, type Banner } from "../../types/profileResTypes";
import characterArray from "../../data/characterNewArray.json";
import bannerArray from "../../data/bannerList.json";
import "../../styles/profiletw.css";
import "./bco-acotw.css";
import fetchUserDetails, {
  setOnlyUserData,
} from "../../global_assets/FetchUserDetails";
import { Icon } from "../../icons/icons";
import { backendUrl } from "../../global_assets/globalPaths";

type mainStatesTypes = {
  profileAvatar: null | string;
  selectedAvatar: null | string;
  profileBanner: null | string;
  selectedBanner: null | string;
  openBco: boolean;
  openAco: boolean;
};

export default function ProfileCSR() {
  const fallbackImage = "/black-fallback.png";
  const [mainStates, setMainStates] = useState<mainStatesTypes>({
    profileAvatar: null,
    selectedAvatar: null,
    profileBanner: null,
    selectedBanner: null,
    openBco: false,
    openAco: false,
  });

  const [initialStates, setInitialStates] = useState({
    email: "Loading...",
    initialName: null,
    initialBanner: null,
    initialAvatar: null,
  });

  const [name, setName] = useState("Loading..."); //i
  const [changesMade, setChangesMade] = useState(false); //i

  useEffect(() => {
    const { initialAvatar, initialBanner, initialName } = initialStates;
    const { profileBanner, profileAvatar } = mainStates;
    if (initialAvatar == null || initialBanner == null || initialName == null)
      return;

    setChangesMade(
      initialName != name ||
        initialBanner != profileBanner ||
        initialAvatar != profileAvatar
    );
  }, [
    name,
    mainStates.profileBanner,
    mainStates.profileAvatar,
    initialStates.initialName,
    initialStates.initialAvatar,
    initialStates.initialBanner,
  ]);

  useEffect(() => {
    fetch(
      `${backendUrl}/api/me?fields=profileName,profileBanner,profilePic,email`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.error("User data could not be fetched.");
          console.error(data.error);
          return;
        }

        const { profileName, profilePic, profileBanner, email } = data.data;

        /*STORING DATABASE SAVED DATA TEMPORARILY*/
        setInitialStates({
          initialAvatar: profilePic,
          initialBanner: profileBanner,
          initialName: profileName,
          email: email,
        });

        setName(profileName);

        setMainStates({
          profileAvatar: profilePic,
          selectedAvatar: profilePic,
          profileBanner,
          selectedBanner: profileBanner,
          openAco: false,
          openBco: false,
        });

        setOnlyUserData(profileName, profilePic);
      });
  }, []);

  //<h3 className="avatar-name">{name}</h3>

  function CharacterCard({ character }: { character: Character }) {
    const img = character?.img;
    if (!img) return null;
    return (
      <li className="avatar-section">
        <img
          className="avatar-list-img"
          src={img}
          onClick={() =>
            setMainStates((prev) => ({ ...prev, selectedAvatar: img }))
          }
          loading="lazy"
          decoding="async"
          alt={`Character image of ${name}`}
        />
      </li>
    );
  }

  function BannerCard({ bc }: { bc: Banner }) {
    return (
      <li className="banner-section">
        <h3 className="banner-heading">{bc.title}</h3>
        <img
          className="banner-list-img"
          src={bc.banner}
          onClick={() =>
            setMainStates((prev) => ({ ...prev, selectedBanner: bc.banner }))
          }
          loading="lazy"
          decoding="async"
          alt={`Banner of  ${bc.title}`}
        />
      </li>
    );
  }

  function updateData() {
    const updatedData = {
      profilePic: mainStates.profileAvatar,
      profileBanner: mainStates.profileBanner,
      profileName: name,
    };

    fetch(`${backendUrl}/api/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchUserDetails().then(() => {
            window.location.reload();
          });
          console.log("✅Successfully updated data.");
        }
      });
  }

  const overlayClose = (name: "bco" | "aco") => (e: any) => {
    if (e.target == e.currentTarget) {
      name == "bco" ? handleBcoClose() : handleAcoClose();
    }
  };

  const handleBcoClose = () => {
    const { profileBanner } = mainStates;
    setMainStates((prev) => ({
      ...prev,
      openBco: false,
      selectedBanner: profileBanner,
    }));
  };

  const handleAcoClose = () => {
    const { profileAvatar } = mainStates;
    setMainStates((prev) => ({
      ...prev,
      openAco: false,
      selectedAvatar: profileAvatar,
    }));
  };

  const handleBcoSave = () => {
    const { selectedBanner } = mainStates;
    setMainStates((p) => ({
      ...p,
      profileBanner: selectedBanner,
      openBco: false,
    }));
  };

  const handleAcoSave = () => {
    const { selectedAvatar } = mainStates;
    setMainStates((prev) => ({
      ...prev,
      profileAvatar: selectedAvatar,
      openAco: false,
    }));
  };

  return (
    <>
      <div
        id="background-change-overlay"
        className={`background-change-overlay ${mainStates.openBco ? "show" : ""}`}
        onClick={overlayClose("bco")}
      >
        <div className="bco-main-box">
          <div className="selected-banner-section">
            <img
              id="selected-banner-img"
              className="selected-banner-img"
              src={mainStates.selectedBanner || fallbackImage}
              loading="lazy"
              decoding="async"
              alt={`Current selected banner`}
            />
            <button
              aria-label="Close Banner Change Section"
              id="sbs-cross-btn"
              className="sbs-cross-btn"
              onClick={handleBcoClose}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="choose-section">
            <div className="cs-text-section">
              <div className="cs-ts-text-big">Background Image Selection</div>
              <div className="cs-ts-text-small">
                Choose your profile background image
              </div>
            </div>
            <div className="can-don-buttons">
              <div
                id="cancel-banner"
                className="can-don-btn"
                onClick={handleBcoClose}
              >
                CANCEL
              </div>
              <div
                id="done"
                className={`can-don-btn don-btn ${mainStates.selectedBanner != mainStates.profileBanner ? "active" : ""}`}
                onClick={handleBcoSave}
              >
                DONE
              </div>
            </div>
          </div>
          <ul id="banners-list" className="banners-list wk-sb">
            {bannerArray.map((banner, i) => (
              <BannerCard key={i} bc={banner} />
            ))}
          </ul>
        </div>
      </div>
      <div
        id="avatar-change-overlay"
        className={`background-change-overlay ${mainStates.openAco ? "show" : ""}`}
        onClick={overlayClose("aco")}
      >
        <div className="bco-main-box">
          <div className="aco-top">
            <img
              id="selected-avatar"
              className="act-avatar-img"
              src={mainStates.selectedAvatar || fallbackImage}
              loading="lazy"
              decoding="async"
              alt={`Current selected avatar`}
            />
            <div className="bco-text-action-sec">
              <div className="bco-text-big">Avatar Selection</div>
              <div className="bco-text-small">You can change it any time !</div>
              <div className="can-don-buttons">
                <div
                  id="cancel-avatar"
                  className="can-don-btn"
                  onClick={handleAcoClose}
                >
                  CANCEL
                </div>
                <div
                  id="save-btn-avatar"
                  className={`can-don-btn don-btn ${mainStates.selectedAvatar != mainStates.profileAvatar ? "active" : ""}`}
                  onClick={handleAcoSave}
                >
                  SAVE
                </div>
              </div>
            </div>
            <button
              aria-label="Close Avatar Change Section"
              id="cross-btn-avatar"
              className="cross-btn-avatar"
              onClick={handleAcoClose}
            >
              <Icon name="close" />
            </button>
          </div>
          <div id="avatars-list" className="avatars-list wk-sb">
            {characterArray.map((character, i) => (
              <CharacterCard key={i} character={character} />
            ))}
            <div className="flex gap-1">
              <div>Note : All avatars are Designed by</div>
              <a href="https://www.freepik.com">
                <div className="text-[cyan] underline">Freepik</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
      <main className="profile-main" style={{ padding: "0 20px" }}>
        <section className="profile-main sec-main">
          <h1 style={{ fontSize: "32px" }}>Edit Profile</h1>
          <div className="profile-main main-box">
            <div id="profile-banner" className="profile-banner">
              <img
                id="profile-banner-main"
                className="profile-banner banner-img"
                data-filter="pb"
                src={mainStates.profileBanner || fallbackImage}
                loading="lazy"
                decoding="async"
                alt={`Saved banner of user ${name}`}
              />
              <button
                aria-label="Open Banner Change Section"
                className="profile-banner-hover"
                onClick={() => {
                  setMainStates((prev) => ({ ...prev, openBco: true }));
                }}
              >
                <p className="update-bg-text">Change Background image</p>
              </button>
              <span
                id="pb-main-loader"
                className={`loader ${mainStates.profileBanner ? "hidden" : ""}`}
              ></span>
            </div>
            <div id="profile-pic" className="profile-pic">
              <img
                id="profile-pic-main"
                className="profile-pic pic-main"
                data-filter="pp"
                src={mainStates.profileAvatar || fallbackImage}
                loading="lazy"
                decoding="async"
                alt={`Saved profile picture of user ${name}`}
              />
              <button
                aria-label="Open Avatar Change Section"
                className="profile-pic-hover"
                onClick={() => {
                  setMainStates((prev) => ({ ...prev, openAco: true }));
                }}
              >
                <p className="update-bg-text change-av-text">Change Avatar</p>
              </button>
              <span
                id="pp-main-loader"
                className={`loader p-pic ${mainStates.profileAvatar ? "hidden" : ""}`}
              ></span>
            </div>
            <div className="profile-name-section">
              <label id="profile-name-label" className="profile-name-label">
                Profile Name
              </label>
              <input
                type="text"
                className="p-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="profile-name-label" style={{ marginTop: "10px" }}>
                This can be changed.
              </p>
            </div>
            <div className="email-section">
              <p className="email-start">Your email : </p>
              <p id="email-text" className="email-text">
                {initialStates.email}
              </p>
            </div>
          </div>
          <div className="sav-can-buttons">
            <button
              aria-label="Save changes"
              id="save"
              className={`save-can-btn sav-btn ${changesMade ? "active" : ""}`}
              onClick={() => updateData()}
            >
              SAVE
            </button>
            <a
              aria-label="Cancel changes and go to homepage"
              id="cancel"
              className="save-can-btn cancel-btn"
              href="/"
            >
              CANCEL
            </a>
          </div>
        </section>
        <div className="flex gap-1">
          <div>Note : All avatars are Designed by</div>
          <a href="https://www.freepik.com">
            <div className="text-[cyan] underline">Freepik</div>
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
