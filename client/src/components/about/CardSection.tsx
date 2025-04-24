import mascot from "/mascot.png";

export default function CardSection({
   children,
   imageAlt,
   reverse = false,
}: {
   children: React.ReactNode;
   imageAlt: string;
   reverse?: boolean;
}) {
 
   return (
      <div className={`flex items-center justify-center mx-auto ${reverse ? "flex-row-reverse" : ""}`}>
         <img src={mascot} alt={imageAlt} className="w-60 h-auto mx-4" />
         <div className="bg-white p-6 rounded-xl shadow-md text-xl leading-relaxed max-w-lg">
            {children}
         </div>
      </div>
   );
}
