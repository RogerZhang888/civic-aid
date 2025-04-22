import SpeechBubble from "./SpeechBubble";
import mascot from "/mascot.png";

export default function About() {
  return (
<div className="p-8 space-y-12 flex flex-col items-center bg-base-100">

{/* Section 1 */}
<div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl">
  <img src={mascot} alt="Leo waving" className="w-32 h-auto" />
  <div className="bg-white p-6 rounded-xl shadow-md text-lg leading-relaxed">
    👋 Hi there! Welcome to <span className="font-bold text-primary">CivicAId</span>. I’m <b>Leo</b>, your friendly SG Chatbot!<br />
    I’m here to help you with anything related to government services — from HDB queries to CPF questions, and more.
  </div>
</div>

{/* Section 2 */}
<div className="flex flex-col md:flex-row-reverse items-center gap-6 max-w-4xl">
  <img src={mascot} alt="Leo reporting issues" className="w-32 h-auto" />
  <div className="bg-white p-6 rounded-xl shadow-md text-lg leading-relaxed">
    🌱 Spotted an issue around your neighbourhood?<br />
    Snap a pic or drop me a message — I’ll help you report things like potholes, faulty streetlights, or cleanliness issues to the right agency.
  </div>
</div>

{/* Section 3 */}
<div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl">
  <img src={mascot} alt="Leo explaining features" className="w-32 h-auto" />
  <div className="bg-white p-6 rounded-xl shadow-md text-lg leading-relaxed">
    📸 You can send me <b>images</b>, <b>text</b>, or both! Just tell me what’s going on, and I’ll do my best to assist or guide you to the right place.
  </div>
</div>

{/* Section 4 */}
<div className="flex flex-col md:flex-row-reverse items-center gap-6 max-w-4xl">
  <img src={mascot} alt="Leo celebrating" className="w-32 h-auto" />
  <div className="bg-white p-6 rounded-xl shadow-md text-lg leading-relaxed">
    🎉 Thanks for being an active citizen!<br />
    Every issue you report helps make our neighbourhoods better. You’ll earn digital <b>badges</b> for resolved cases — and top contributors each month get a <b>special prize</b>!
  </div>
</div>

{/* Final Section */}
<div className="text-xl font-semibold text-center">
  Ready when you are — just type away! 💬
</div>

</div>

     
  );
}
