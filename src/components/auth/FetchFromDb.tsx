import { useEffect } from "react";
import fetchUserDetails from "../../global_assets/FetchUserDetails";

export default function FetchFromDb() {
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return null;
}