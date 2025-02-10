import Authentication from "@/components/auth/Authentication";
import MainPage from "@/components/templates/MainPage";
export default function Home() {
  return (
    <Authentication>
      <MainPage />
    </Authentication>
  );
}
