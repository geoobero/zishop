const sanityClient = require("@sanity/client");
const axios = require("axios");
const { Buffer } = require("buffer");

const client = sanityClient({
  projectId: "7tu1ayj5",
  dataset: "production",
  apiVersion: "2026-06-05",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function addImages() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("Error: SANITY_WRITE_TOKEN environment variable is not set.");
    process.exit(1);
  }

  console.log("Fetching products from Sanity...");
  const products = await client.fetch(`*[_type=="product"]{_id, slug}`);
  console.log(`Found ${products.length} products.`);

  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const slug = product.slug.current;
      const imageUrl = `https://picsum.photos/seed/${slug}/600/600`;

      console.log(`  ${slug}... fetching image`);
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data);

      console.log(`  ${slug}... uploading to Sanity`);
      const asset = await client.assets.upload("image", buffer, {
        filename: `${slug}.jpg`,
      });

      console.log(`  ${slug}... patching product`);
      await client
        .patch(product._id)
        .set({
          image: [
            {
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
            },
          ],
        })
        .commit();

      console.log(`  ✓ ${slug}`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${product.slug?.current || product._id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} images added, ${failed} failed.`);
}

addImages();
