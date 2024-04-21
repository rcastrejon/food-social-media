import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { getProfileDataByUsername } from "~/server/models/profile"

export async function ProfilePage({ username }: { username: string }) {
  const userProfile = await getProfileDataByUsername(username)
  if (!userProfile) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl md:mt-5">
      <div className="mx-4 sm:mx-auto sm:max-w-lg">
        <div className="grid grid-cols-[1fr,_auto] items-center gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold">Perfil</h3>
            <p className="text-sm">{userProfile.username}</p>
          </div>
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20">
            <AvatarFallback>
              {userProfile.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-3 flex gap-2">
          {/* <span className="text-sm text-muted-foreground">10 likes</span>
          <span className="text-sm text-muted-foreground">·</span> */}
          <span className="text-sm text-muted-foreground">
            {userProfile.recipes.length} receta(s) publicadas(s)
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-1 sm:mt-10 sm:grid-cols-3">
        {userProfile.recipes.map((recipe) => (
          <Link key={recipe.id} href={`/p/${recipe.id}`}>
            <AspectRatio ratio={1}>
              <Image src={recipe.media.url} alt={recipe.title} fill />
            </AspectRatio>
          </Link>
        ))}
      </div>
    </div>
  )
}
