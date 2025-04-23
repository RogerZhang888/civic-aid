//deprecated

type SpeechBubbleProps = {
  text: string;
  direction?: "left" | "right";
};

export default function SpeechBubble({ text, direction = "left" }: SpeechBubbleProps) {
  const isLeft = direction === "left";

  return (
    <div className={`chat ${isLeft ? "chat-start" : "chat-end"} max-w-xl`}>
      <div className="chat-image avatar">
        <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
          🦁
        </div>
      </div>
      <div className="chat-bubble bg-primary text-primary-content">{text}</div>
    </div>
  );
}
