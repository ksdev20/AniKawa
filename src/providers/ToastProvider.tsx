import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster position="bottom-right" richColors closeButton duration={3000} />
  );
}
