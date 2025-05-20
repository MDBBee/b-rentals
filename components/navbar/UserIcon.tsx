import { LuUser2 } from 'react-icons/lu';
import { fetchProfileImage } from '@/utils/actions';
import Image from 'next/image';

async function UserIcon() {
  const profileImage = await fetchProfileImage();

  if (profileImage)
    return (
      <Image
        src={profileImage}
        alt="Profile Image"
        className="w-7 h-7 rounded-full object-cover"
        width={28}
        height={28}
        priority
      />
    );
  return <LuUser2 className="w-6 h-6 bg-primary rounded-full text-white" />;
}
export default UserIcon;
