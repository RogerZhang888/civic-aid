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
    offset: ["center 50%", "center 30%"],
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 1], [1, 0]));
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1]));

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={`w-full max-w-6xl h-screen flex items-center justify-center mx-auto px-4 ${
        reverse ? "flex-row-reverse" : ""
      }`}
    >
      <img src={imageSrc} alt={imageAlt} className="w-60 h-auto mx-4" />
      <div className="bg-white p-6 rounded-xl shadow-md text-2xl leading-relaxed max-w-l">
        {children}
      </div>
    </motion.div>
  );
}
