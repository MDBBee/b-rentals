'use server';

import {
  createReviewSchema,
  imageSchema,
  profileSchema,
  propertySchema,
  validateWithZodSchema,
} from './schemas';

import db from './db';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadImage } from './supabase';
import { calculateTotals } from './calculateTotals';
import { formatDate } from './format';

// Utils funcs
// a) get auth user
const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error('You must be logged in to access this route');
  }
  if (!user.privateMetadata.hasProfile) redirect('/profile/create');
  return user;
};
// b) fetch profile
export const fetchProfile = async () => {
  const user = await getAuthUser();

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) return redirect('/profile/create');
  return profile;
};
// c) Fetch Image
export const fetchProfileImage = async () => {
  const user = await currentUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });
  return profile?.profileImage;
};
// d) Render error
const renderError = (error: unknown): { message: string } => {
  // console.log('⛔⛔⛔ CATCH ERROR', JSON.stringify(error, null, 2));
  console.log('⛔⛔⛔ CATCH ERROR', error);

  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

// Create Profile
export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const user = await currentUser();
    // console.log('USER✅✅', user);
    if (!user) throw new Error('Please login to create a profile');

    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? '',
        ...validatedFields,
      },
    });
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
  redirect('/');
};

// UpdateProfile

export const updateProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });
    revalidatePath('/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
    return renderError(error);
  }
};

// Update profile Image
export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawImage = formData.get('image') as File;
    const validatedImage = validateWithZodSchema(imageSchema, {
      image: rawImage,
    });

    const fullPath = await uploadImage(validatedImage.image);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath('/profile');
    return { message: 'Profile image updated successfully' };
  } catch (error) {
    return renderError(error);
  }
};

// Create property action
export const createPropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await fetchProfile();

  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(propertySchema, rawData);

    // Image Validation & Upload
    const rawImage = formData.get('image') as File;

    const validatedImage = validateWithZodSchema(imageSchema, {
      image: rawImage,
    });
    const imageFullPath = await uploadImage(validatedImage.image);

    await db.property.create({
      data: { ...validatedFields, image: imageFullPath, profileId: user.id },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect('/');
};

// Fetch properties;
export const fetchProperties = async ({
  search = '',
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    where: {
      category,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      image: true,
      price: true,
    },
  });
  return properties;
};

// Fetch FavoriteId
export const fetchFavoriteId = async ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

// Toggle Favorite button
export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();

  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? 'Removed from Faves!' : 'Added to Faves' };
  } catch (error) {
    return renderError(error);
  }
};

// Fetch Favorited properties
export const fetchFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          price: true,
          country: true,
          image: true,
        },
      },
    },
  });
  return favorites.map((favorite) => favorite.property);
};

// Fetch Property Details
export const fetchPropertyDetails = (id: string) => {
  return db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
    },
  });
};

// Reviews actions
// Create Reviews
export async function createReviewAction(prevState: any, formData: FormData) {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);
    await db.review.create({
      data: {
        ...validatedFields,
        profileId: user.id,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: 'Review submitted successfully' };
  } catch (error) {
    return renderError(error);
  }
}

// Fetch Property reviews
export const fetchPropertyReviews = async (propertyId: string) => {
  const reviews = await db.review.findMany({
    where: { propertyId },
    select: {
      id: true,
      comment: true,
      rating: true,
      createdAt: true,
      profile: {
        select: { firstName: true, profileImage: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return reviews;
};

// Fetch Reviews by user
export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
};

// Delete Reviews
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        profileId: user.id,
      },
    });

    revalidatePath('/reviews');
    return { message: 'Review deleted successfully!' };
  } catch (error) {
    return renderError(error);
  }
};

// Find existing reviews
export const findExistingReview = async (
  userId: string,
  propertyId: string
) => {
  return db.review.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
};

// Fetch properties rating
// GroupBy - Uniqueness of a field
export async function fetchPropertyRating(propertyId: string) {
  const result = await db.review.groupBy({
    by: ['propertyId'],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      propertyId,
    },
  });

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
}

// Fetch  Property details with bookings
export const fetchPropertyBookingDetails = (id: string) => {
  return db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
      bookings: {
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
    },
  });
};

// Create Booking action
export const createBookingAction = async ({
  propertyId,
  checkIn,
  checkOut,
}: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  let bookingId: null | string = null;

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { price: true },
  });

  if (!property) {
    return { message: 'Property not found' };
  }
  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price,
  });

  try {
    await db.booking.deleteMany({
      where: {
        profile: { clerkId: user.id },
        paymentStatus: false,
      },
    });

    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });

    bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }
  redirect(`/checkout?bookingId=${bookingId}`);
};

// Fetch Bookings
export const fetchBookings = async () => {
  const user = await getAuthUser();

  const bookings = await db.booking.findMany({
    where: { profileId: user.id, paymentStatus: true },
    include: {
      property: {
        select: { id: true, name: true, country: true },
      },
    },
    orderBy: { checkIn: 'desc' },
  });

  return bookings;
};

// Delete Bookings
export async function deleteBookingAction(prevState: { bookingId: string }) {
  const { bookingId } = prevState;
  const user = await getAuthUser();

  try {
    const result = await db.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });

    revalidatePath('/bookings');
    return { message: 'Booking deleted successfully!' };
  } catch (error) {
    return renderError(error);
  }
}

// Rentals page fetch
// Fetch rentals
export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profile: {
        clerkId: user.id,
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightsSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          totalNights: true,
        },
      });

      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          orderTotal: true,
        },
      });

      return {
        ...rental,
        totalNightsSum: totalNightsSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    })
  );

  return rentalsWithBookingSums;
};

// Delete rentals
export async function deleteRentalAction(prevState: { propertyId: string }) {
  const { propertyId } = prevState;
  const user = await getAuthUser();

  try {
    await db.property.delete({
      where: {
        id: propertyId,
        profile: { clerkId: user.id },
      },
    });

    revalidatePath('/rentals');
    return { message: 'Rental deleted successfully!' };
  } catch (error) {
    return renderError(error);
  }
}

// Editing Rentasl
export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();

  return db.property.findUnique({
    where: {
      id: propertyId,
      profile: { clerkId: user.id },
    },
  });
};

export const updatePropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profile: { clerkId: user.id },
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Update Successful' };
  } catch (error) {
    return renderError(error);
  }
};

export const updatePropertyImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;
  const rawImage = formData.get('image') as File;

  try {
    const validatedImage = validateWithZodSchema(imageSchema, {
      image: rawImage,
    });
    const fullPath = await uploadImage(validatedImage.image);

    await db.property.update({
      where: {
        id: propertyId,
        profile: { clerkId: user.id },
      },
      data: { image: fullPath },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Rental Image Updated Successful' };
  } catch (error) {
    return renderError(error);
  }
};

// Reservations page
export const fetchReservations = async () => {
  const user = await getAuthUser();
  const res = await db.booking.findMany({
    where: {
      paymentStatus: true,
    },
    orderBy: { createdAt: 'asc' },

    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      },
    },
  });

  return res;
};

// Admin page
// Admin auth
const getAdminUser = async () => {
  const user = await getAuthUser();

  if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
  return user;
};

// fetch stats for Admin
export const fetchStats = async () => {
  await getAdminUser();

  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count({
    where: { paymentStatus: true },
  });

  return {
    usersCount,
    propertiesCount,
    bookingsCount,
  };
};

// fetch chatData for Admin

export const fetchChartsData = async () => {
  await getAdminUser();
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date;
  // console.log('***___***SMA:', sixMonthsAgo);
  // console.log('***___***TOF:', typeof sixMonthsAgo);

  const bookings = await db.booking.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
      paymentStatus: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  let bookingsPerMonth = bookings.reduce((total, current) => {
    const date = formatDate(current.createdAt, true);
    // console.log('***___***FDB:', date);
    // console.log('***___***TOF:', typeof date);

    const existingEntry = total.find((entry) => entry.date === date);

    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    return total;
  }, [] as Array<{ date: string; count: number }>);
  // console.log('***___***FDB:', bookingsPerMonth);

  return bookingsPerMonth;
};

// Fect reservation stats
export const fetchReservationStats = async () => {
  const user = await getAuthUser();

  const properties = await db.property.count({
    where: {
      profile: { clerkId: user.id },
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      profile: { clerkId: user.id },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};
