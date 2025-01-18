import Authentication from "@/components/templates/Authentication";
import MainPage from "@/components/templates/MainPage";
export default function Home() {
  return (
    <Authentication>
      <MainPage />;
    </Authentication>
  );
}
