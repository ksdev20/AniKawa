// import BCO from "../../components/profile-components/BCO";
// import ACO from "../../components/profile-components/ACO";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { type Character } from "../../filters/AnimeDataTypes";
import type { Banner } from "../../filters/AnimeDataTypes";
import characterArray from '../../data/characterAvatarsFinal.json';
import bannerArray from '../../data/bannerList.json';
import '../../styles/profile.css';
import './bco-aco.css';
import { useState, useEffect, useRef } from 'react';
import fetchUserDetails, { setOnlyUserData } from "../../global_assets/FetchUserDetails";


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
        fetch('http://localhost:20000/api/me?fields=profileName,profileBanner,profilePic,email', {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.error("User data could not be fetched.");
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
                    loading="lazy" decoding="async"/>
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
                    loading="lazy" decoding="async"/>
            </div>
        )
    }

    function updateData(){
        const updatedData = { profilePic: profileAvatar, profileBanner, profileName: name};

        fetch('http://localhost:20000/api/update', {
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
                            src={selectedBanner || fallbackImage} />
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
                    <div id="banners-list" className="banners-list">
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
                            src={selectedAvatar || fallbackImage} />
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
                    <div id="avatars-list" className="avatars-list">
                        {characterArray.map((character, i) => (
                            <CharacterCard key={i} character={character} />
                        ))}
                    </div>
                </div>
            </div>
            <Navbar />
            <div className="profile-main" style={{ padding: "0 20px" }}>
                <div className="profile-main sec-main">
                    <div style={{ fontSize: "32px" }}>Edit Profile</div>
                    <div className="profile-main main-box">
                        <div id="profile-banner" className="profile-banner">
                            <img
                                id="profile-banner-main"
                                className="profile-banner banner-img"
                                data-filter="pb"
                                src={profileBanner || fallbackImage}
                            />
                            <div className="profile-banner-hover" onClick={() => { setOpenBco(!openBco) }}>
                                <div className="update-bg-text">
                                    Change Background image
                                </div>
                            </div>
                            <span id="pb-main-loader" className={`loader ${profileBanner? 'hidden' : ''}`}></span>
                        </div>
                        <div id="profile-pic" className="profile-pic">
                            <img
                                id="profile-pic-main"
                                className="profile-pic pic-main"
                                data-filter="pp"
                                src={profileAvatar || fallbackImage}
                            />
                            <div className="profile-pic-hover" onClick={() => { setOpenAco(!openAco) }}>
                                <div className="update-bg-text change-av-text">
                                    Change Avatar
                                </div>
                            </div>
                            <span id="pp-main-loader" className={`loader p-pic ${profileAvatar ? 'hidden' : ''}`}></span>
                        </div>
                        <div className="profile-name-section">
                            <div id="profile-name-label" className="profile-name-label">
                                Profile Name
                            </div>
                            <input
                                type="text"
                                className="p-name-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div
                                className="profile-name-label"
                                style={{ marginTop: "10px" }}
                            >
                                This can be changed.
                            </div>
                        </div>
                        <div className="email-section">
                            <div className="email-start">Your email : </div>
                            <div id="email-text" className="email-text">{email}</div>
                        </div>
                    </div>
                    <div className="sav-can-buttons">
                        <div id="save" className={`save-can-btn sav-btn ${changesMade ? 'active' : ''}`} onClick={() => updateData()}>SAVE</div>
                        <a id="cancel" className="save-can-btn cancel-btn" href="/">
                            CANCEL
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}