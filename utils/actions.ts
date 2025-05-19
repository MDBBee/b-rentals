'use server';

import { profileSchema } from './schemas';

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);
    console.log(validatedFields);
    return { message: 'Profile Created' };
  } catch (error: any) {
    console.log(JSON.stringify(error, null, 2));
    return {
      message: `Field: ${error.issues[0].path[0]}\n \tError: ${error.issues[0].message}`,
    };
  }
};
