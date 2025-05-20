import z from 'zod';
import { ZodSchema } from 'zod';

export const profileSchema = z.object({
  // firstName: z.string().max(5, { message: 'max length is 5' }),
  firstName: z.string().min(2, {
    message: 'First Name field must be filled, with at least 2 characters!',
  }),
  lastName: z.string().min(2, {
    message: 'Last Name field must be filled, with at least 2 characters!',
  }),
  username: z.string().min(2, {
    message: 'Username field must be filled, with at least 2 characters!',
  }),
});

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.log('ERROR⛔⛔⛔..', JSON.stringify(result.error, null, 2));

    const errors = result.error.issues.map((error) => error.message);
    throw new Error(errors.join(','));
  }
  return result.data;
}

export const imageSchema = z.object({
  image: validateFile(),
});

function validateFile() {
  const maxUploadSize = 1024 * 1024;
  const acceptedFileTypes = ['image/'];
  return z
    .instanceof(File)
    .refine((file) => {
      return !file || file.size <= maxUploadSize;
    }, `File size must be less than 1 MB`)
    .refine((file) => {
      return (
        !file || acceptedFileTypes.some((type) => file.type.startsWith(type))
      );
    }, 'File must be an image');
}
