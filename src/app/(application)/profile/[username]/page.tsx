import { ProfilePage } from "../profile-page"

export default async function Page({
  params,
}: {
  params: { username: string }
}) {
  return <ProfilePage username={params.username} />
}
