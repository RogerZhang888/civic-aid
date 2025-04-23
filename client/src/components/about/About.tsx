import mascot from "/mascot.png";
import CardSection from "./CardSection";

export default function About() {
  return (
    <div className="p-8 space-y-12 flex flex-col items-center bg-base-100 relative z-0">
      {/* Background image */}
      <div
        className="fixed inset-0 z-[-1] bg-no-repeat bg-cover bg-center bg-fixed opacity-20 min-h-screen"
        style={{ backgroundImage: `url('/heartland.avif')` }}
      ></div>

      {/* Each scroll section */}
      <section className="relative w-full h-[500vh]">
        <CardSection imageSrc={mascot} imageAlt="Leo waving">
          👋 Hi there! Welcome to <span className="font-bold text-primary">CivicAId</span>. I’m <b>Leo</b>, your friendly SG Chatbot!<br />
          I’m here to help you with anything related to government services — from HDB queries to CPF questions, and more.
        </CardSection>

        <CardSection imageSrc={mascot} imageAlt="Leo reporting issues" reverse>
          🌱 Spotted an issue around your neighbourhood?<br />
          Snap a pic or drop me a message — I’ll help you report things like potholes, faulty streetlights, or cleanliness issues to the right agency.
        </CardSection>

        <CardSection imageSrc={mascot} imageAlt="Leo explaining features">
          📸 You can send me <b>images</b>, <b>text</b>, or both! Just tell me what’s going on, and I’ll do my best to assist or guide you to the right place.
        </CardSection>

        <CardSection imageSrc={mascot} imageAlt="Leo celebrating" reverse>
          🎉 Thanks for being an active citizen!<br />
          Every issue you report helps make our neighbourhoods better. You’ll earn digital <b>badges</b> for resolved cases — and top contributors each month get a <b>special prize</b>!
        </CardSection>

        <CardSection imageSrc={mascot} imageAlt="Leo ready to help">
          Ready when you are — just type away! 💬
        </CardSection>
      </section>
    </div>
  );
}
