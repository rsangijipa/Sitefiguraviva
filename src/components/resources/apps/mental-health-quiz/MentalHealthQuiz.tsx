import App from "./App";

export default function MentalHealthQuiz({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <div className="h-full min-h-0 w-full">
      <App />
    </div>
  );
}
