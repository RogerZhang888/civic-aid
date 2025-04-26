export default function CardSection({
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
         <img src={imageSrc} alt={imageAlt} className="w-auto h-60 mx-4" />
         <div className="bg-white p-6 rounded-xl shadow-md text-xl leading-relaxed max-w-lg">
            {children}
         </div>
      </div>
   );
}
