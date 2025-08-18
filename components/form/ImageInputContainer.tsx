"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import FormContainer from "./FormContainer";
import { type actionFunction } from "@/utils/types";
import { LuUser2 } from "react-icons/lu";
import { ImSpinner5 } from "react-icons/im";
import { updateProfileImageAction } from "@/utils/actions";
import { useFormStatus } from "react-dom";

const ButtonFormSubmit = () => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? <ImSpinner5 className="animate-spin" /> : "Upload Image"}
    </Button>
  );
};

function ImageInputContainer({
  image,
  name,
  action,
  text,
}: {
  image: string;
  name: string;
  action: actionFunction;
  text: string;
  children?: React.ReactNode;
}) {
  const [isUpdateFormVisible, setUpdateFormVisible] = useState(false);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [displayedImage, setDisplayedImage] = useState(image);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file && !image) return;
    if (!file && image) {
      setDisplayedImage(image); // preview
      return;
    }
    if (!file) return;

    if (file) {
      const imageBlob = URL.createObjectURL(file); // local preview

      // setImageFile(file); // File for backend
      setDisplayedImage(imageBlob); // preview
    }
  };
  console.log("DIS IMG", displayedImage);

  const userIcon = (
    <LuUser2 className="w-24 h-24 bg-primary rounded text-white mb-4" />
  );
  return (
    <FormContainer action={updateProfileImageAction}>
      <div>
        {displayedImage ? (
          <Image
            src={displayedImage as string}
            alt={name}
            width={100}
            height={100}
            className="rounded object-cover mb-4 w-24 h-24"
          />
        ) : (
          userIcon
        )}
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            setUpdateFormVisible((prev) => !prev);
            isUpdateFormVisible && setDisplayedImage(image);
          }}
          className="mb-4"
        >
          {!isUpdateFormVisible ? text : "Cancel picture update"}
        </Button>
        {isUpdateFormVisible && (
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="imageChange"
              name="files"
              multiple
            />
            {displayedImage === image ? "" : <ButtonFormSubmit />}
          </div>
        )}
      </div>
    </FormContainer>
  );
}
export default ImageInputContainer;
