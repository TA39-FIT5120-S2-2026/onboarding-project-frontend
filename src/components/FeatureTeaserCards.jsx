import { Link } from 'react-router-dom';
import { TreePine, CloudSun, ArrowRight } from 'lucide-react';
import Card from './ui/Card.jsx';

const TEASERS = [
  {
    to: '/refuges',
    icon: TreePine,
    title: 'Find a quiet space',
    description: 'Parks, libraries and quiet corners near you.',
  },
  {
    to: '/forecast',
    icon: CloudSun,
    title: 'Check the forecast',
    description: 'Predicted crowd levels for the next hour.',
  },
];

// The "icon row that links somewhere" pattern from the peer-review
// feedback - also the fix for a homepage that otherwise hides two of the
// app's three features behind the nav.
export default function FeatureTeaserCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TEASERS.map((teaser) => (
        <Link key={teaser.to} to={teaser.to} className="group block rounded-xl">
          <Card className="h-full transition-colors group-hover:border-accent">
            <teaser.icon className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">{teaser.title}</p>
            <p className="mt-1 text-caption text-ink/60">{teaser.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-caption font-medium text-accent">
              Open
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
