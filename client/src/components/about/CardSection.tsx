import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

interface CardSectionProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

export default function CardSection({ children, imageSrc, imageAlt, reverse = false }: CardSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["center 90%", "center 10%"],
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 1], [1, 0]));
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 0.95]));

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={`w-full max-w-3xl h-screen flex items-center justify-center mx-auto px-4 ${
        reverse ? "flex-row-reverse" : ""
      }`}
    >
      <img src={imageSrc} alt={imageAlt} className="w-32 h-auto mx-4" />
      <div className="bg-white p-6 rounded-xl shadow-md text-lg leading-relaxed max-w-md">
        {children}
      </div>
    </motion.div>
  );
}
