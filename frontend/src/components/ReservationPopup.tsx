import { useLocation, useNavigate, Link, type LinkProps } from 'react-router-dom';
import { WorkshopDetail } from '../pages/WorkshopDetail';

export function ReserveLink({ workshopId, ...props }: Omit<LinkProps, 'to'> & { workshopId: string }) {
  const { pathname, search, hash } = useLocation();
  const params = new URLSearchParams(search);
  params.set('reserve', workshopId);
  return <Link {...props} to={{ pathname, search: params.toString(), hash }} preventScrollReset />;
}

export function ReservationPopup() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const id = params.get('reserve');
  if (!id) return null;

  params.delete('reserve');
  return <WorkshopDetail key={id} popup={{
    id,
    returnUrl: pathname + search + hash,
    close: () => navigate({ pathname, search: params.toString(), hash }, { replace: true, preventScrollReset: true }),
  }} />;
}
