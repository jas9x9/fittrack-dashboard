import { ProgressRing } from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <div className="flex items-center gap-8 p-8">
      <ProgressRing progress={25} />
      <ProgressRing progress={65} />
      <ProgressRing progress={90} />
      <ProgressRing progress={100} />
    </div>
  );
}