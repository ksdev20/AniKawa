import { useEffect } from "react";

const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

interface props {
  animenanoid: string | undefined;
  slug: string | undefined;
}

export default async function HandleECClick({ animenanoid, slug }: props) {
  async function handleClick() {
    if (localStorage.getItem("isLoggedIn") == "false") return;
    await fetch(
      `${backendUrl}/api/addToList?item=${animenanoid},${slug}&field=history`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.log("Failed to add to history");
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  useEffect(() => {
    handleClick();
  }, []);

  return null;
}
