import Loading from "./Loading";

const LoadingApp = () => {
  return (
    <div className="fixed bg-leftBarBg h-screen size-full flex-center">
      <Loading loading="infinity" color="info" classNames="w-24 h-24" />
    </div>
  );
};

export default LoadingApp;
