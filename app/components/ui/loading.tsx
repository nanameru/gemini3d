export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium">Processing...</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Analyzing physics diagram and generating 3D model...
      </p>
    </div>
  );
}
