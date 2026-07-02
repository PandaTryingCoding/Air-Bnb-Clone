import { createClient } from "@supabase/supabase-js";

const bucket = process.env.SUPABASE_BUCKET ?? "Air-BNB-Clone";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_KEY in .env"
  );
}

const supabase = createClient(url, key);

let bucketReady = false;

async function ensureBucketExists() {
  if (bucketReady) return;

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  const exists = buckets?.some((item) => item.name === bucket);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 1024 * 1024,
    });

    if (createError) {
      throw new Error(
        `Storage bucket "${bucket}" was not found. Create a public bucket with that exact name in Supabase → Storage, or set SUPABASE_BUCKET in .env to match your bucket name. (${createError.message})`
      );
    }
  }

  bucketReady = true;
}

export const uploadImage = async (image: File) => {
  await ensureBucketExists();

  const timeStamp = Date.now();
  const newName = `${timeStamp}-${image.name}`;
  const { error } = await supabase.storage.from(bucket).upload(newName, image, {
    cacheControl: "3600",
    contentType: image.type,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Storage bucket "${bucket}" was not found. Create a public bucket with that exact name in Supabase → Storage.`
      );
    }

    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};
