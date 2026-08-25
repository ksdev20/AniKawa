export function getGuestId() {
  let id = localStorage.getItem("anikawa_guest_id");

  if (!id) {
    id = crypto.randomUUID();

    localStorage.setItem("anikawa_guest_id", id);
  }

  return id;
}
