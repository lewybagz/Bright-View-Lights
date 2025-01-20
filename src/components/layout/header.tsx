import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user ? (
            <Button variant="ghost" className="text-sm" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
