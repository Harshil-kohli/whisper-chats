import { LoaderIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <LoaderIcon className="size-12 animate-spin text-orange-500" />
    </div>
  );
}
export default PageLoader;
