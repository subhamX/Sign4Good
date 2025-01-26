import HomeClient from "./HomeClient";
import { getUserInServer } from "./utils/setAuthTokenAsCookie";




export default async function Home() {
  const user = await getUserInServer();
  return <HomeClient user={user} />
}