'use client';
import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import FormContainer from './FormContainer';
import ImageInput from './ImageInput';
import { SubmitButton } from './Buttons';
import { type actionFunction } from '@/utils/types';
import { LuUser2 } from 'react-icons/lu';

type ImageInputContainerProps = {
  image: string;
  name: string;
  action: actionFunction;
  text: string;
  children?: React.ReactNode;
};

function ImageInputContainer(props: ImageInputContainerProps) {
  const { image, name, action, text } = props;
  const [isUpdateFormVisible, setUpdateFormVisible] = useState(false);
  const [imageFile, setImageFile] = useState<File | string>(image);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('FILE', e.target.files?.[0]);
    console.log('URL.createObjectURL(file)', URL.createObjectURL(file));

    setImageFile(file);
    setImageFile(URL.createObjectURL(file)); // Show local preview
  };

  const userIcon = (
    <LuUser2 className="w-24 h-24 bg-primary rounded text-white mb-4" />
  );
  return (
    <div>
      {imageFile ? (
        <Image
          src={imageFile as string}
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
        onClick={() => setUpdateFormVisible((prev) => !prev)}
      >
        {text}
      </Button>
      {isUpdateFormVisible && (
        <div className="max-w-lg mt-4">
          <div className="flex flex-col items-center gap-4">
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
      )}
    </div>
  );
}
export default ImageInputContainer;
