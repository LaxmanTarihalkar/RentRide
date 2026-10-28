import { useState } from "react";

export type AuthModalType = "login" | "signup" | "forgot-password" | null;

export const useAuthModals = () => {
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const openLogin = () => setActiveModal("login");
  const openSignup = () => setActiveModal("signup");
  const openForgotPassword = () => setActiveModal("forgot-password");
  const closeModal = () => setActiveModal(null);

  const switchToLogin = () => setActiveModal("login");
  const switchToSignup = () => setActiveModal("signup");
  const switchToForgotPassword = () => setActiveModal("forgot-password");

  return {
    activeModal,
    openLogin,
    openSignup,
    openForgotPassword,
    closeModal,
    switchToLogin,
    switchToSignup,
    switchToForgotPassword,
  };
};