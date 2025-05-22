export default function AboutCard({
   children,
   imageSrc,
   imageAlt,
   reverse = false,
}: {
   children: React.ReactNode;
   imageSrc: string;
   imageAlt: string;
   reverse?: boolean;
}) {
   return (
      <div className={`flex items-center justify-center mx-auto ${reverse ? "flex-row-reverse" : ""}`}>
         <img src={imageSrc} alt={imageAlt} className="w-auto mx-0 h-30 sm:h-60 sm:mx-4" />
         <div className="bg-white p-6 rounded-xl shadow-md text-sm sm:text-xl leading-5 sm:leading-relaxed max-w-lg">
            {children}
         </div>
      </div>
   );
}
