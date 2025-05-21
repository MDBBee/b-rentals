import EmptyList from '@/components/home/EmptyList';
import PropertiesList from '@/components/home/PropertiesList';
import { fetchFavorites } from '@/utils/actions';
import { PropertyCardProps } from '@/utils/types';

async function FavoritesPage() {
  const favorites = await fetchFavorites();

  if (favorites.length === 0) {
    return <EmptyList />;
  }

  const reFav: PropertyCardProps[] = favorites.filter(
    (f): f is PropertyCardProps => f !== null
  );

  return <PropertiesList properties={reFav} />;
}
export default FavoritesPage;
