export const npoItems = [
  {
    label: "Browse Anime",
    href: "/list",
  },
  {
    label: "Popular",
    href: "/list?sort=popular",
  },
  {
    label: "New Releases",
    href: "/list?sort=newest",
  },
  {
    label: "Browse by Genre",
    href: "/categories",
  },
];

export const categoryItems = [
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

export const legalItems = [
    {
        label: 'About Us',
        href: '/legal/about',
        idx: 4
    },
    {
        label: 'Terms of Services',
        href: '/legal/tos',
        idx: 5
    },
    {
        label: 'Privacy Policy',
        href: '/legal/privacy-policy',
        idx: 6
    },
    {
        label: 'Credits',
        href: '/legal/credits',
        idx: 7
    },
];

export const blnItems = [
    {
        label: 'Signup',
        href: '/signup/',
        h1: 'Create Account',
        h2: 'Join for free !'
    },
    {
        label: 'Login',
        href: '/login/',
        h1: 'Log In',
        h2: 'Welcome back to Anikawa !'
    },
];

export const alnItems: { label: string, icon: string, link?: string }[] = [
    { label: 'Settings', icon: "settings", link: "/profile/settings" }, { label: 'Episodes History', icon: "history", link: "/history" }, { label: 'Logout', icon: "logout" }
];