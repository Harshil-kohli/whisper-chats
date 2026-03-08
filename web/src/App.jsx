import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "@clerk/clerk-react";
import PageLoader from "./components/PageLoader";
import useUserSync from "./hooks/useUserSync";
import { InstallPrompt } from "./components/InstallPrompt";
import DesktopDownloadPrompt from "./components/DesktopDownloadPrompt";

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  useUserSync();

  if (!isLoaded) return <PageLoader />;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/chat"} />} />
        <Route path="/chat" element={isSignedIn ? <ChatPage /> : <Navigate to={"/"} />} />
      </Routes>
      <InstallPrompt />
      <DesktopDownloadPrompt />
    </>
  );
}

export default App;
