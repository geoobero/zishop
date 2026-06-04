import sanityClient from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import config from "./config";

//connect to sanity
export const client = sanityClient({
  projectId: config.projectId,
  dataset: config.dataset,
  apiVersion: "2026-05-04",
  useCdn: true,
  token: process.env.SANITY_WRITE_TOKEN,
});

//be able to use sanity images
const builder = imageUrlBuilder(client);

export const urlFor = (source:any) => builder.image(source)