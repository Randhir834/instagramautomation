import { SearchX } from 'lucide-react';
import { PublicMessage } from '@/components/layout/PublicMessage';

export default function PublicNotFound() {
  return (
    <PublicMessage icon={SearchX} title="We couldn’t find that page">
      The link may be mistyped, or it may have been taken down. Check with whoever sent it to you.
    </PublicMessage>
  );
}
