import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useSession } from '../../context/SessionContext.jsx';

// The only "reset" in the app - session state is memory-only by design
// (no localStorage), so a refresh already clears everything; this just
// gives users an in-app way to do the same thing without losing their
// place, plus a confirmation so an accidental tap doesn't lose an
// in-progress plan.
export default function StartOverButton({ className = '' }) {
  const navigate = useNavigate();
  const { resetSession } = useSession();

  function handleClick() {
    const confirmed = window.confirm(
      'Start over? This clears your planned route and preferences for this session.',
    );
    if (!confirmed) return;
    resetSession();
    navigate('/');
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Start over
    </button>
  );
}
