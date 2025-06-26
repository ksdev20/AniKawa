const mainMenu = document.getElementById("main-menu");
const sidebarOverlay = document.getElementById("sidebarOverlay");
let isShowingSidebar = false;

const isIndex = window.location.pathname.endsWith("index.html");

function showSidebar() {
    mainMenu.classList.add("active");
    sidebarOverlay.style.display = "block";
    document.body.style.overflowY = "hidden";
    isShowingSidebar = true;
}

function closeSidebar() {
    mainMenu.classList.remove("active");
    sidebarOverlay.style.display = "none";
    document.body.style.overflowY = "visible";
    isShowingSidebar = false;
}


mainMenu.addEventListener('click', () => {
    if (isShowingPerson) {
        closePersonMenu();
    }

    if (isShowingSidebar) {
        closeSidebar();
        return;
    }

    showSidebar();
});

sidebarOverlay.addEventListener('click', (event) => {
    if (event.target == sidebarOverlay) {
        closeSidebar();
    }
});

const sidebarNew = document.getElementById("sidebar-new");

sidebarNew.addEventListener('click', function (event) {
    const currentPage = window.location.pathname;

    if (currentPage.endsWith("/new.html") || currentPage.endsWith("new.html")) {
        event.preventDefault();
        closeSidebar();
    }
    localStorage.setItem('selectedSidebarBtn', JSON.stringify({
        title: "New Anime",
        des: "Newly Added Anime",
        filter: "NEWEST"
    }));
    window.location.href = isIndex ? "./sidebar/new.html" : "../sidebar/new.html";
});

const sideBarPopular = document.getElementById("sidebar-popular");

sideBarPopular.addEventListener('click', function (event) {
    const currentPage = window.location.pathname;

    if (currentPage.endsWith("/new.html") || currentPage.endsWith("new.html")) {
        event.preventDefault();
        closeSidebar();
    }
    localStorage.setItem('selectedSidebarBtn', JSON.stringify({
        title: "Popular Anime",
        des: "Most Popular Anime",
        filter: "POPULARITY"
    }));
    window.location.href = isIndex ? "./sidebar/new.html" : "../sidebar/new.html";
});

function createCategoryButton(category) {
    return `<div class="sidebar-button dropdown">${category}</div>`
}


const categoryButton = document.getElementById("category-button");
const categoryArrow = document.getElementById("category-arrow");
const categoryDropdown = document.getElementById("category-dropdown");
let isShowingCategory = false;

categoryButton.addEventListener('click', () => {
    if (isShowingCategory) {
        categoryDropdown.style.display = "none";
        const downpath = "M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z";
        categoryArrow.querySelector('path').setAttribute('d', downpath);
        isShowingCategory = false;
        return;
    }

    categoryDropdown.style.display = "block";
    const uppath = "M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z";
    categoryArrow.querySelector('path').setAttribute('d', uppath);
    isShowingCategory = true;
});

const categories = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Music", "Romance", "Sci-Fi", "Sports", "Supernatural", "Thriller"];

categories.forEach(category => {
    const btnHtml = createCategoryButton(category);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = btnHtml;
    const btnElement = tempDiv.firstElementChild;

    btnElement.addEventListener('click', () => {
        localStorage.setItem('selectedCategory', JSON.stringify({
            name: category,
            extra: " "
        }));
        window.location.href = isIndex ? "./category/category.html" : "../category/category.html";
    });

    categoryDropdown.appendChild(btnElement);
});

const logSignOverlay = document.getElementById("log-sign-overlay");
const personMenu = document.getElementById("person-menu");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
let isShowingPerson = false;

function closePersonMenu() {
    personMenu.classList.remove("active");
    logSignOverlay.style.display = "none";
    document.body.style.overflowY = "visible";
    isShowingPerson = false;
}

function showPersonMenu() {
    personMenu.classList.add("active");
    logSignOverlay.style.display = "flex";
    document.body.style.overflowY = "hidden";
    isShowingPerson = true;
}

personMenu.addEventListener('click', () => {
    if (isShowingSidebar) {
        closeSidebar();
    }

    if (isShowingPerson) {
        closePersonMenu();
        return;
    }

    showPersonMenu();
});

logSignOverlay.addEventListener('click', (event) => {
    if (event.target == logSignOverlay) {
        closePersonMenu();
    }
});

/*server data fetch*/

function fetchLoginData() {
    const baseURL = window.location.origin;
    fetch(`${baseURL}/api/me?fields=profileName,profilePic`, {
        method: 'GET',
        credentials: "include"
    })
        .then(res => {
            if (!res) {
                console.warn("Not Logged in. Response error");
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data || !data.data) return;
            const user = data.data;
            if (!user) {
                alert("Failed to fetch user data.");
                return;
            }
            document.getElementById("before-login").style.display = "none";
            document.getElementById("after-login").style.display = "flex";
            document.querySelector(".account-pic").src = user.profilePic;
            document.querySelector(".account-name").innerHTML = user.profileName;
        })
        .catch(e => {
            console.error(e.message);
        });
}

document.addEventListener('DOMContentLoaded', fetchLoginData);


const wBtnI = document.getElementById("watchlist-btn-index");
const wBtnP = document.getElementById("watchlist-btn-person");
const hBtnP = document.getElementById("history-btn-person");
const logoutBtn = document.getElementById("logout-btn-person");

if (wBtnI) {
    wBtnI.addEventListener('click', () => {
        if (window.location.pathname.endsWith('watchlistHistory.html')) return;
        localStorage.setItem('selectedBtn', 'watchlist');
        window.location.href = isIndex ? "./log-sign/watchlistHistory.html" : "../log-sign/watchlistHistory.html";
    });
}

if (wBtnP) {
    wBtnP.addEventListener('click', () => {
        localStorage.setItem('selectedBtn', 'watchlist');
        window.location.href = isIndex ? "./log-sign/watchlistHistory.html" : "../log-sign/watchlistHistory.html";
    });
}

if (hBtnP){
    hBtnP.addEventListener('click', () => {
        localStorage.setItem('selectedBtn', 'history');
        window.location.href = isIndex ? "./log-sign/watchlistHistory.html" : "../log-sign/watchlistHistory.html";
    });
}

function logout(){
    const baseURL = window.location.origin;
    fetch(`${baseURL}/api/logout`, {
        method: 'POST',
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success){
            alert(data.message);
            window.location.reload();
        } else {
            alert(data.error);
        }
    })
    .catch(e => {
        console.error(e.message);
    });
}

if (logoutBtn){
    logoutBtn.addEventListener('click', logout);
}

const pBtn = document.getElementById("profile-btn-in-its-html");

if (pBtn){
    pBtn.addEventListener('click', () => {
        if (isShowingPerson){
            closePersonMenu();
        }
    })
}