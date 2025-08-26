import { useEffect } from "react";
import fetchUserDetails, {
  checkCookie,
} from "../../global_assets/FetchUserDetails";

export default function FetchFromDb() {
  useEffect(() => {
    main();
  }, []);

  async function main() {
    const loggedIn = await checkCookie();
    if (loggedIn) {
      const success = await fetchUserDetails();
      if (!success) {
        console.warn("User Details not fetched after 3 retries");
      }
    }
  }

  return null;
}