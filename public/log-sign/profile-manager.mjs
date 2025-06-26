const profileBannerMain = document.getElementById("profile-banner-main");
const profileAvatarMain = document.getElementById("profile-pic-main");
const inputElement = document.querySelector(".p-name-input");


/*setting initial avatar, banner, profile names*/
let savedBannersrc = "";
let savedAvatarSrc = "";
let savedValue = "";

/*db*/
const baseURL = window.location.origin;
fetch(`${baseURL}/api/me?fields=email,profileName,profilePic,profileBanner`, {
    method: 'GET',
    credentials: 'include'
})
    .then(res => res.json())
    .then(data => {
        const user = data.data;
        const { profileName, profilePic, profileBanner, email } = user;

        savedValue = profileName;
        savedAvatarSrc = profilePic;
        savedBannersrc = profileBanner;

        profileAvatarMain.src = profilePic;
        profileBannerMain.src = profileBanner;
        inputElement.value = profileName;

        [profileAvatarMain, profileBannerMain].forEach(img => {
            const filter = img.dataset.filter;
            const loader = filter == 'pp' ? document.getElementById("pp-main-loader") : document.getElementById("pb-main-loader");

            img.addEventListener('load', () => {
                loader.classList.add("hidden");
            });

            if (img.complete) loader.classList.add("hidden");
        });

        document.getElementById("email-text").innerHTML = email;
    })
    .catch(e => {
        console.warn(e.message);
    });

function checkIfUnchanged() {
    return (
        profileAvatarMain.src == savedAvatarSrc &&
        profileBannerMain.src == savedBannersrc &&
        inputElement.value == savedValue
    );
}

/*banner change overlay handling*/

let isShowingBannerChangeOverlay = false;
const bcOverlay = document.getElementById("background-change-overlay");
let initialSelectedBanner = "";

function hideBcOverlay() {
    bcOverlay.style.display = "none";
    isShowingBannerChangeOverlay = false;
}

function showBCOverlay() {
    bcOverlay.style.display = "flex";
    isShowingBannerChangeOverlay = true;
    loadBanners();
}

const selectedBanner = document.getElementById("selected-banner-img");

document.getElementById("profile-banner").addEventListener('click', () => {
    if (!isShowingBannerChangeOverlay) {
        showBCOverlay();
        initialSelectedBanner = profileBannerMain.src;
        selectedBanner.src = initialSelectedBanner;
    }
});

/* 3 ways of just closing banner overlay*/

bcOverlay.addEventListener('click', (event) => {
    if (event.target == bcOverlay) {
        selectedBanner.src = initialSelectedBanner;
        hideBcOverlay();
    }
});

document.getElementById("sbs-cross-btn").addEventListener('click', () => {
    selectedBanner.src = initialSelectedBanner;
    hideBcOverlay();
});

document.getElementById("cancel-banner").addEventListener('click', () => {
    selectedBanner.src = initialSelectedBanner;
    hideBcOverlay();
});

/*banner selection handler */

const doneBtn = document.getElementById("done");

document.querySelectorAll(".banner-section").forEach(banner => {
    banner.addEventListener('click', () => {
        const bannerSrc = banner.querySelector(".banner-list-img").src;
        selectedBanner.src = bannerSrc;

        if (bannerSrc != profileBannerMain.src) {
            doneBtn.classList.add("active");
        } else {
            doneBtn.classList.remove("active");
        }
    });
});

doneBtn.addEventListener('click', () => {
    if (doneBtn.classList.contains("active")) {
        profileBannerMain.src = selectedBanner.src;

        checkIfUnchanged() ? saveBtn.classList.remove("active") : saveBtn.classList.add("active");

        hideBcOverlay();
    }
});

/*profile name handler*/

const saveBtn = document.getElementById("save");
const pNameLabel = document.getElementById("profile-name-label");

let currentProfileBanner = " ";

inputElement.addEventListener('input', () => {
    if (checkIfUnchanged()) {
        saveBtn.classList.remove("active");
    } else {
        saveBtn.classList.add("active");
    }

    if (inputElement.value.length < 2) {
        pNameLabel.classList.add("active");
        pNameLabel.innerHTML = "Enter at least 2 characters";
    } else {
        pNameLabel.classList.remove("active");
        pNameLabel.innerHTML = "Profile Name";
    }
});

/*avatar change overlay handling */

const acOverlay = document.getElementById("avatar-change-overlay");
let isShowingACO = false;

let currentProfileAvatar = " ";
let initialSelectedAvatar = " ";

function showACO() {
    acOverlay.style.display = "flex";
    isShowingACO = true;
    loadAvatars();
}

function hideACO() {
    acOverlay.style.display = "none";
    isShowingACO = false;
}

const selectedAvatar = document.getElementById("selected-avatar");

document.getElementById("profile-pic").addEventListener('click', () => {
    if (!isShowingACO) {
        showACO();
        initialSelectedAvatar = profileAvatarMain.src;
        selectedAvatar.src = initialSelectedAvatar;
    }
});

/*avatar selection handling */

const saveBtnAvatar = document.getElementById("save-btn-avatar");

document.querySelectorAll(".avatar-section").forEach(avatar => {
    avatar.addEventListener('click', () => {
        const avatarSrc = avatar.querySelector(".avatar-list-img").src;

        selectedAvatar.src = avatarSrc;

        if (initialSelectedAvatar != avatarSrc) {
            saveBtnAvatar.classList.add("active");
        } else {
            saveBtnAvatar.classList.remove("active");
        }
    });
});

saveBtnAvatar.addEventListener('click', () => {
    if (saveBtnAvatar.classList.contains("active")) {
        initialSelectedAvatar = selectedAvatar.src;
        profileAvatarMain.src = initialSelectedAvatar;

        if (checkIfUnchanged()) {
            saveBtn.classList.remove("active");
        } else {
            saveBtn.classList.add("active");
        }

        hideACO();
    }
});

/* 3 ways of just closing avatar overlay*/

document.getElementById("cross-btn-avatar").addEventListener('click', () => {
    hideACO();
});

document.getElementById("cancel-avatar").addEventListener('click', () => {
    selectedAvatar.src = initialSelectedAvatar;
    hideACO();
});

acOverlay.addEventListener('click', (event) => {
    if (event.target == acOverlay) {
        selectedBanner.src = initialSelectedBanner;
        hideACO();
    }
});


/*save btn profile html main */

saveBtn.addEventListener('click', async () => {
    if (saveBtn.classList.contains("active")) {

        const updatedData = {
            profilePic: profileAvatarMain.src,
            profileBanner: profileBannerMain.src,
            profileName: inputElement.value
        }

        fetch(`${baseURL}/api/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(updatedData)
        })
            .then(res => res.json())
            .then(data => {
                if (!data) {
                    console.log("Empty response");
                } else {
                    console.log("Profile updated : ", data.data);
                    saveBtn.classList.remove("active");
                    window.location.reload();
                }
            })
            .catch(e => {
                console.error(e.message);
                alert(e.message);
            });
    }
});

document.getElementById("cancel").addEventListener('click', () => {
    window.location.href = "../index.html";
});

/*banner loading logic */

import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";

const bannersList = document.getElementById("banners-list");

function createBanner(name, image) {
    return `<div class="banner-section">
        <div class="banner-heading">${name}</div>
        <img class="banner-list-img"
            src=${image} />
    </div>`;
}

function loadBanners() {
    bannersList.innerHTML = ' ';
    const animeArray = aniOneAsiaDataAnilist3.slice().sort((a, b) => {
        const scoreA = a?.anilist?.score.split(' ')?.[0] || 5;
        const scoreB = b?.anilist?.score.split(' ')?.[0] || 4;
        return scoreB - scoreA;
    }).slice(0, 200);

    const usedTitles = [];

    animeArray.forEach(anime => {
        const name = anime?.anilist?.title || anime?.cleanTitle || "N/A";
        if (usedTitles.includes(name)) return;

        const image = anime?.anilist?.bannerImage || "N/A";
        if (image == 'N/A') return;

        const bannerHtml = createBanner(name, image);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bannerHtml;

        const bannerElement = tempDiv.firstElementChild;

        bannerElement.addEventListener('click', () => {
            const bannerSrc = bannerElement.querySelector(".banner-list-img").src;
            selectedBanner.src = bannerSrc;

            if (bannerSrc != profileBannerMain.src) {
                doneBtn.classList.add("active");
            } else {
                doneBtn.classList.remove("active");
            }
        });

        bannersList.appendChild(bannerElement);
        usedTitles.push(name);
    });
}

import { characterAvatars } from "../data/characterAvatars.mjs";
import { characterAvatars2 } from "../data/characterAvatars2.mjs";
import { characterAvatars3 } from "../data/characterAvatars3.mjs";


const avatarsList = document.getElementById("avatars-list");

function createAvatar(name, image) {
    return `<div class="avatar-section">
        <div class="avatar-name">${name}</div>
        <img class="avatar-list-img"
            src=${image} />
    </div>`;
}

function loadAvatars() {
    avatarsList.innerHTML = ' ';

    const addedAvatars = [];

    const arrays = [characterAvatars, characterAvatars2, characterAvatars3];

    arrays.forEach(array => {
        array.forEach(character => {
            const name = character?.name?.first || character?.name?.userPreferred || character?.name?.native;
            if (addedAvatars.includes(name)) return;

            const image = character?.image;
            if (!image || image.endsWith("default.jpg")) return;

            const avatarHtml = createAvatar(name, image);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = avatarHtml;

            const avatarElement = tempDiv.firstElementChild;

            avatarElement.addEventListener('click', () => {
                const avatarSrc = avatarElement.querySelector(".avatar-list-img").src;

                selectedAvatar.src = avatarSrc;

                if (initialSelectedAvatar != avatarSrc) {
                    saveBtnAvatar.classList.add("active");
                } else {
                    saveBtnAvatar.classList.remove("active");
                }
            });

            avatarsList.appendChild(avatarElement);
            addedAvatars.push(name);
        });
    });
}