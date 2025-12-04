import { StatusCard } from "../../components/StatusCard";
import type { StatusCardViewModel } from "../hooks/useStatusCardController";

type StatusCardSectionProps = {
  cardState: StatusCardViewModel;
  cardIsRunning: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
};

const StatusCardSection = ({
  cardState,
  cardIsRunning,
  onPause,
  onResume,
  onReset,
}: StatusCardSectionProps) => (
  <div className="mt-6 flex justify-center px-6">
    <StatusCard
      status={cardState.status}
      characterName={cardState.characterName}
      styleName={cardState.styleName ?? undefined}
      modeLabel={cardState.modeLabel ?? undefined}
      intervalMinutes={cardState.intervalMinutes ?? undefined}
      imageSrc={cardState.imageSrc}
      isRunning={cardIsRunning}
      nextPlayLabel={cardState.nextPlayLabel}
      onPause={onPause}
      onResume={onResume}
      onReset={onReset}
    />
  </div>
);

export { StatusCardSection };
