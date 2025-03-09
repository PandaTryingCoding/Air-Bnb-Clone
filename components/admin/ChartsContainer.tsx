import { fetchChartsData } from "@/utils/actions";
import Charts from "./Charts";

async function ChartsContainer() {
  const bookings = await fetchChartsData();
  if (bookings.length < 1) return null;
  return <Charts data={bookings} />;
}
export default ChartsContainer;
