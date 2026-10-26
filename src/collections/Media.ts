import type { CollectionConfig } from "payload";
import { contentCollectionAccess } from "./access";
import { revalidateCollection } from "./hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  hooks: revalidateCollection("media"),
  labels: {
    singular: "Media",
    plural: "Media",
  },
  admin: {
    group: "Content",
  },
  access: contentCollectionAccess,
  upload: {
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 576,
        position: "centre",
      },
      {
        name: "hero",
        width: 1920,
        height: 1080,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "video/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt Text",
    },
  ],
};
