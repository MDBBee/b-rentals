const uploadImageUploadthing = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/uploadthing/imageUploader', {
    method: 'POST',
    body: formData,
  });
};

// import {
//   generateUploadButton,
//   generateUploadDropzone,
// } from '@uploadthing/react';

// import type { OurFileRouter } from '@/app/api/uploadthing/core';

// export const UploadButton = generateUploadButton<OurFileRouter>();
// export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
