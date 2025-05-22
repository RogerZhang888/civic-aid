export default function LoadingSpinner() {
   return (
      <section className="w-full h-full flex flex-col space-y-2 justify-center items-center">
         <span className="loading loading-spinner loading-xl"/>
         <div className="text-xl">Loading...</div>
      </section>
   );
}