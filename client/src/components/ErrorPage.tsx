export default function ErrorPage() {
   return (
      <section className="w-screen h-screen flex flex-col space-y-3 justify-center items-center">
         <div className="text-gray-500 text-2xl">Oops! Something went wrong.</div>
         <button 
            className="btn btn-primary btn-lg"
            onClick={() => window.location.reload()}
         >
            Reload
         </button>
      </section>
   );
}
