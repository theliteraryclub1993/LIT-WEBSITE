// Supabase bucket setup utilities
import { supabase } from '@/lib/supabase';

/**
 * Ensure a storage bucket exists. If it already exists, the call is ignored.
 * Useful for programmatically creating required buckets at runtime.
 */
export async function ensureBucket(bucket: string) {
  try {
    const { error } = await (supabase.storage as any).createBucket(bucket, {
      public: false,
      allowedMimeTypes: ['image/*'],
    });
    if (error) {
      // If bucket already exists, Supabase returns a 409 conflict with message containing "already exists"
      if (error.message && error.message.includes('already exists')) {
        return;
      }
      console.error(`Error creating bucket "${bucket}":`, error.message);
    } else {
      console.log(`Bucket "${bucket}" created successfully.`);
    }
  } catch (e) {
    console.error('Unexpected error while ensuring bucket:', e);
  }
}
