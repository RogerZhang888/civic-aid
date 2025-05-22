export default function GenericLoading({ str }: { str?: string }) {
   return (
      <section className="w-full h-full flex flex-col space-y-2 justify-center items-center text-gray-500">
         <span className="loading loading-spinner loading-xl"/>
         <div className="text-xl">{str || "Loading..."}</div>
      </section>
   )
}
