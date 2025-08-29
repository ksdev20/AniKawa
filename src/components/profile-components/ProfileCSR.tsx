// import BCO from "../../components/profile-components/BCO";
// import ACO from "../../components/profile-components/ACO";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { type Character } from "../../filters/AnimeDataTypes";
import type { Banner } from "../../filters/AnimeDataTypes";
import characterArray from '../../data/characterAvatarsFinal.json';
import bannerArray from '../../data/bannerList.json';
import '../../styles/profiletw.css';
import './bco-acotw.css';
import { useState, useEffect, useRef } from 'react';
import fetchUserDetails, { setOnlyUserData } from "../../global_assets/FetchUserDetails";
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default function ProfileCSR() {
    const fallbackImage = '/black-fallback.png';
    const [profileBanner, setPB] = useState<string | null>(null);
    const [profileAvatar, setPA] = useState<string | null>(null);
    const [name, setName] = useState("Loading...");
    const [email, setEmail] = useState("Loading...");

    const [initialName, setIN] = useState<string | null>(null);
    const [initialBanner, setIB] = useState<string | null>(null);
    const [initialAvatar, setIA] = useState<string | null>(null);
    const [changesMade, setChangesMade] = useState(false);

    const [openBco, setOpenBco] = useState(false);
    const [openAco, setOpenAco] = useState(false);

    const [selectedBanner, setSB] = useState<string | null>(null);
    const [selectedAvatar, setSA] = useState<string | null>(null);

    useEffect(() => {
        if (initialAvatar == null || initialBanner == null || initialName == null) return;

        setChangesMade(initialName != name || initialBanner != profileBanner || initialAvatar != profileAvatar);
    }, [name, profileBanner, profileAvatar, initialName, initialAvatar, initialBanner]);

    useEffect(() => {
        fetch(`${backendUrl}/api/me?fields=profileName,profileBanner,profilePic,email`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.error("User data could not be fetched.");
                    console.error(data.error);
                    return;
                }

                const { profileName, profilePic, profileBanner, email } = data.data;

                /*STORING DATABASE SAVED DATA TEMPORARILY*/
                setIB(profileBanner);
                setIA(profilePic);
                setIN(profileName);

                setName(profileName);
                setEmail(email);

                setPB(profileBanner);
                setSB(profileBanner);

                setPA(profilePic);
                setSA(profilePic);

                setOnlyUserData(profileName, profilePic);
            });
    }, []);

    function CharacterCard({ character }: { character: Character }) {
        const name = character.name?.first || character.name?.full || character.name?.userPreferred || character.name?.native || 'N/A';
        const img = character?.image || null;
        if (img == null) return (<div></div>);

        return (
            <div className="avatar-section">
                <div className="avatar-name">{name}</div>
                <img className="avatar-list-img"
                    src={img} onClick={() => setSA(img)} 
                    loading="lazy" decoding="async"
                    alt={`Character image of ${name}`}/>
            </div>
        );
    }

    function BannerCard({ bc }: { bc: Banner }) {
        return (
            <div className="banner-section">
                <div className="banner-heading">{bc.title}</div>
                <img className="banner-list-img"
                    src={bc.banner}
                    onClick={() => setSB(bc.banner)} 
                    loading="lazy" decoding="async"
                    alt={`Banner of  ${bc.title}`}/>
            </div>
        )
    }

    function updateData(){
        const updatedData = { profilePic: profileAvatar, profileBanner, profileName: name};

        fetch(`${backendUrl}/api/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success){
                fetchUserDetails().then(() => {
                    window.location.reload()
                });
                console.log("✅Successfully updated data.");
            }
        })
    }

    return (
        <>
            <div id="background-change-overlay" className={`background-change-overlay ${openBco ? 'show' : ''}`} onClick={(e) => {
                if (e.target == e.currentTarget) {
                    setOpenBco(false);
                    if (profileBanner) setSB(profileBanner);
                };
            }}>
                <div className="bco-main-box">
                    <div className="selected-banner-section">
                        <img id="selected-banner-img" className="selected-banner-img"
                            src={selectedBanner || fallbackImage}
                            loading="lazy" decoding="async" alt={`Current selected banner`}/>
                        <div id="sbs-cross-btn" className="sbs-cross-btn" onClick={() => {
                            setOpenBco(false);
                            if (profileBanner) setSB(profileBanner);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                fill="#ffffff">
                                <path
                                    d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="choose-section">
                        <div className="cs-text-section">
                            <div className="cs-ts-text-big">Background Image Selection</div>
                            <div className="cs-ts-text-small">Choose your profile background image</div>
                        </div>
                        <div className="can-don-buttons">
                            <div id="cancel-banner" className="can-don-btn" onClick={() => {
                                setOpenBco(false);
                                if (profileBanner) setSB(profileBanner);
                            }}>CANCEL</div>
                            <div id="done" className={`can-don-btn don-btn ${selectedBanner != profileBanner ? 'active' : ''}`} onClick={() => {
                                setPB(selectedBanner);
                                setOpenBco(false);
                            }}>DONE</div>
                        </div>
                    </div>
                    <div id="banners-list" className="banners-list wk-sb">
                        {bannerArray.map((banner, i) => (
                            <BannerCard key={i} bc={banner} />
                        ))}
                    </div>
                </div>
            </div>
            <div id="avatar-change-overlay" className={`background-change-overlay ${openAco ? 'show' : ''}`} onClick={(e) => {
                if (e.target == e.currentTarget) {
                    setOpenAco(false);
                    if (profileAvatar) setSA(profileAvatar);
                };
            }}>
                <div className="bco-main-box">
                    <div className="aco-top">
                        <img id="selected-avatar" className="act-avatar-img"
                            src={selectedAvatar || fallbackImage}
                            loading="lazy" decoding="async" alt={`Current selected avatar`}/>
                        <div className="bco-text-action-sec">
                            <div className="bco-text-big">Avatar Selection</div>
                            <div className="bco-text-small">You can change it any time !</div>
                            <div className="can-don-buttons">
                                <div id="cancel-avatar" className="can-don-btn" onClick={() => {
                                    setOpenAco(false);
                                    if (profileAvatar) setSA(profileAvatar);
                                }}>CANCEL</div>
                                <div id="save-btn-avatar" className={`can-don-btn don-btn ${selectedAvatar != profileAvatar ? 'active' : ''}`} onClick={() => {
                                    setPA(selectedAvatar);
                                    setOpenAco(false);
                                }}>SAVE</div>
                            </div>
                        </div>
                        <div id="cross-btn-avatar" className="cross-btn-avatar" onClick={() => {
                            setOpenAco(false);
                            if (profileAvatar) setSA(profileAvatar);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                fill="#ffffff">
                                <path
                                    d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                        </div>
                    </div>
                    <div id="avatars-list" className="avatars-list wk-sb">
                        {characterArray.map((character, i) => (
                            <CharacterCard key={i} character={character} />
                        ))}
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
                                src={profileBanner || fallbackImage}
                                loading="lazy" decoding="async" alt={`Saved banner of user ${name}`}
                            />
                            <button className="profile-banner-hover" onClick={() => { setOpenBco(!openBco) }}>
                                <p className="update-bg-text">
                                    Change Background image
                                </p>
                            </button>
                            <span id="pb-main-loader" className={`loader ${profileBanner? 'hidden' : ''}`}></span>
                        </div>
                        <div id="profile-pic" className="profile-pic">
                            <img
                                id="profile-pic-main"
                                className="profile-pic pic-main"
                                data-filter="pp"
                                src={profileAvatar || fallbackImage}
                                loading="lazy" decoding="async" alt={`Saved profile picture of user ${name}`}
                            />
                            <button className="profile-pic-hover" onClick={() => { setOpenAco(!openAco) }}>
                                <p className="update-bg-text change-av-text">
                                    Change Avatar
                                </p>
                            </button>
                            <span id="pp-main-loader" className={`loader p-pic ${profileAvatar ? 'hidden' : ''}`}></span>
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
                            <p
                                className="profile-name-label"
                                style={{ marginTop: "10px" }}
                            >
                                This can be changed.
                            </p>
                        </div>
                        <div className="email-section">
                            <p className="email-start">Your email : </p>
                            <p id="email-text" className="email-text">{email}</p>
                        </div>
                    </div>
                    <div className="sav-can-buttons">
                        <button aria-label="Save changes" id="save" className={`save-can-btn sav-btn ${changesMade ? 'active' : ''}`} onClick={() => updateData()}>SAVE</button>
                        <a aria-label="Cancel changes and go to homepage" id="cancel" className="save-can-btn cancel-btn" href="/">
                            CANCEL
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}