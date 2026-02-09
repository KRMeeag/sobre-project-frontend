import BrandingPanel from "../components/BrandingPanel";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex font-['Work_Sans']">
      <BrandingPanel />
      <AuthForm />
    </div>
  );
}
