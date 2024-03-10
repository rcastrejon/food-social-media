import type { FileRouter } from "uploadthing/next"
import { createUploadthing } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { validateRequest } from "~/server/auth/validate-request"
import { createMedia } from "~/server/models/media"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({}) => {
      // This code runs on your server before upload
      const { user } = await validateRequest()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const created = await createMedia({
        userId: metadata.userId,
        ...file,
      })
      if (!created) throw new UploadThingError("Failed to save media")
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
